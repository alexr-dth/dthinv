import {
  addOrderMutation,
  authUser,
  editRequestMutation,
  fetchPaginatedRequests,
  fetchRequestsFormatted,
  fetchRequests,
  fetchSuppliers,
  removeOrderMutation,
  showRequest,
} from '@/api/api'
import InlineLoader from '@/components/InlineLoader'
import PendingRequestedCard from '@/components/Cards/PendingRequestedCard'
import usePaginatedQuery from '@/hooks/usePaginatedQuery'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { LucideAlertTriangle } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import toast from 'react-hot-toast'
import totalUnits from '@/utils/totalUnits'
import totalPrice from '@/utils/totalPrice'

const groupDataArr = (data = []) => {
  return data.reduce((acc, row) => {
    // Jan 1, 2001
    const dateLabel = new Date(row.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    // {label: "Jan 1, 2001" }
    let dateObj = acc.find((d) => d['label'] === dateLabel)
    if (!dateObj) {
      dateObj = { label: dateLabel, suppliers: [] }
      acc.push(dateObj)
    }
    const supplier = row.item?.supplier || {}
    let supplierObj = dateObj.suppliers.find((s) => s.name === supplier.name)
    if (!supplierObj) {
      // {name: "Supplier Name", barcode_qr: "abcxyz", requested_items: []}
      supplierObj = { ...supplier, requested_items: [] }

      // {label: "Jan 1, 2001", supplier: [{..., requested_items: []}]  }
      dateObj.suppliers.push(supplierObj)
    }
    // Push item
    supplierObj.requested_items.push(row)
    return acc
  }, [])
}

export const Route = createFileRoute('/orders/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate({ from: '/' })
  const { state } = useLocation()

  const [pdfOptionExpanded, setPdfOptionExpanded] = useState(false)
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const [selectedIds, setSelectedIds] = useState(state.selectedIds ?? [])
  const [selectedSupplier, setSelectedSupplier] = useState(state.supplier ?? {})

  // same supplier and selected only
  const { data = [], dataUpdatedAt } = useQuery({
    queryKey: [
      'requested-items',
      { supplierId: selectedSupplier.id, inArray: [...selectedIds] },
    ],
    queryFn: () =>
      fetchRequests({ supplierId: selectedSupplier.id, inArray: selectedIds }),
    enabled: !!selectedIds?.length,
    staleTime: Infinity,
  })

  const [requestedItems, setRequestedItems] = useState(data)
  useEffect(() => {
    setRequestedItems((prev) => {
      return data
        .map((item) => item.id)
        .map((id, index) => {
          return prev.find((p) => p.id === id) ?? data[index]
        })
    })
  }, [dataUpdatedAt])

  const { data: suppliersData = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })

  const { mutateAsync: createOrder } = useMutation({
    mutationFn: addOrderMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
  const { mutateAsync: deleteOrder } = useMutation({
    mutationFn: removeOrderMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
  const closeModal = () => setActiveModal(null)
  const handleSave = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = e.nativeEvent.submitter
    btn.disabled = true
    try {
      const { id: newOrderId } = await createOrder({
        name: form.elements['order_name']?.value,
        notes: form.elements['order_notes']?.value,
        created_at: new Date(form.elements['created_at']?.value).toISOString(), // local to UTC
        supplier_id: selectedSupplier.id,
        actor_id: authUser.id,
        status: 'await_quote',
      })

      try {
        const asyncUpdateRequests = requestedItems.map((rItem) => {
          return editRequestMutation({
            id: rItem.id,
            order_id: newOrderId,
            request_status: 'processing',
            requested_quantity: rItem.requested_quantity,
            quoted_quantity: rItem.requested_quantity,
            evaluator_id: authUser.id,
          })
        })
        await Promise.all(asyncUpdateRequests)
        setPdfOptionExpanded(false)
        toast.success('Order ticket created')
        // console.log('Available at: ', `/orders/${newOrderId}`)
        navigate({
          to: '/orders/$orderId',
          hash: 'export-btn',
          params: { orderId: newOrderId },
          replace: true,
        })
      } catch (error) {
        await deleteOrder(newOrderId)
        console.log(error)
        toast.error('Process failed')
      }
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  useEffect(() => {
    document.body.style.overflow = activeModal?.name ? 'hidden' : 'auto'
  }, [activeModal])
  // if (isLoading) return <PageLoader />
  // if (error) return <ErrorScreen error={error} />
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {/* {activeModal.name == 'editRequested' && (
              <EditQuantityModal/>
            )} */}

            {activeModal.name == 'addRequested' && (
              <AddRequestedModal
                supplier={selectedSupplier}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                closeModal={closeModal}
              />
            )}
          </div>
        </div>
      )}

      <div className="page-container">
        <div className="flex justify-between">
          <div className="divide-x ">
            <Link to="/" className="action-link !ps-0">
              Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="action-link px-1"
            >
              Back
            </button>
          </div>
        </div>

        <h2 className="page-title">Create Order</h2>

        {!(selectedSupplier.name && selectedSupplier.id) ? (
          <>
            <div className="font-bold text-sm">Choose a supplier:</div>
            <div className="space-y-2 mb-6 overflow-auto py-5 px-10">
              <InlineLoader waitFor={suppliersLoading} />
              {suppliersData.map((sup) => (
                <button
                  key={sup.id}
                  className="btn w-full"
                  onClick={() => setSelectedSupplier(sup)}
                >
                  {sup.name || 'undefined'}
                </button>
              ))}
            </div>
            <div className="text-sm">
              Or choose items from the "
              <Link to="/requests" className="action-link underline !px-0">
                Requested Items
              </Link>
              " page.
            </div>
          </>
        ) : (
          <>
            <form
              id="add-order-form"
              className="space-y-3"
              onSubmit={handleSave}
            >
              <div>
                <span className="font-bold text-sm">Ordered by:</span> <br />
                <input
                  type="text"
                  className="text-lg w-full pointer-events-none"
                  defaultValue={authUser.username}
                  readOnly
                />
                <input
                  name="actor_id"
                  type="hidden"
                  defaultValue={authUser.id}
                  readOnly
                />
              </div>

              <div>
                <span className="font-bold text-sm">Date:</span> <br />
                <input
                  name="created_at"
                  type="datetime-local"
                  className="text-lg w-full pointer-events-none"
                  readOnly
                  value={new Date(
                    Date.now() - new Date().getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)}
                />
              </div>

              <div>
                <span className="font-bold text-sm">Order name:</span> <br />
                <input
                  name="order_name"
                  type="text"
                  className="form-control-bare w-full text-lg"
                  placeholder={`e.g. ${selectedSupplier.name} Order`}
                  defaultValue={`${selectedSupplier.name} Order - ${new Date(Date.now()).toDateString()}`}
                  required
                />
              </div>

              <div>
                <span className="font-bold text-sm">Notes:</span> <br />
                <textarea
                  name="order_notes"
                  className="form-control-bare w-full text-lg"
                  rows={2}
                  placeholder="Add remarks..."
                />
              </div>
            </form>

            <div className="flex justify-between mt-10 items-end">
              <div className="font-bold text-sm">
                <div>
                  <i className="page-notes">One order, one supplier.</i>
                  Products included:
                </div>
              </div>
              <button
                className="action-link text-sm"
                onClick={() => setActiveModal({ name: 'addRequested' })}
              >
                Browse Items
              </button>
            </div>

            <div className="space-y-2">
              <SupplierProductSetWithPrice
                supplier={selectedSupplier}
                requestedItems={requestedItems}
                setRequestedItems={setRequestedItems}
              />
            </div>

            <hr className="border-t-6 mt-4 mb-10" />

            <div className="relative">
              <button
                className="btn w-full"
                form="add-order-form"
                // onClick={() => {
                //   setPdfOptionExpanded(!pdfOptionExpanded)
                // }}
              >
                Save and Export to PDF
              </button>

              {pdfOptionExpanded && (
                <div className="absolute border bg-white shadow rounded p-1 left-0 bottom-[110%] w-full">
                  <div className="flex flex-col divide-y divide-gray-400">
                    <button
                      className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      value="internal_english"
                      form="add-order-form"
                    >
                      Internal (English)
                    </button>

                    <button
                      className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      value="internal_chinese"
                      form="add-order-form"
                    >
                      Internal (Chinese)
                    </button>

                    <button
                      className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      value="external_english"
                      form="add-order-form"
                    >
                      External (English)
                    </button>

                    <button
                      className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      value="external_internal"
                      form="add-order-form"
                    >
                      External (Chinese)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

const SupplierProductSetWithPrice = ({
  supplier,
  requestedItems,
  setRequestedItems,
}) => {
  const [expanded, setExpanded] = useState(false)

  const handleQuantityChange = (id) => {
    const raw = prompt('Quantity:')
    if (raw === null) return // user cancelled
    const newVal = parseInt(raw, 10)
    if (Number.isNaN(newVal)) return // invalid input

    setRequestedItems((prev) =>
      prev.map((reqI) =>
        reqI.id === id ? { ...reqI, requested_quantity: newVal } : reqI,
      ),
    )
  }

  return (
    <div>
      <div className="border rounded">
        <h3
          className={` p-2 flex items-center gap-1 ${expanded && 'border-b-1'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <h5 className="text-lg font-semibold uppercase">{supplier.name}</h5>
            {!expanded && (
              <span className="text-xs text-gray-500">
                ({requestedItems?.length || 0} request/s)
              </span>
            )}
          </div>

          <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
        </h3>

        {expanded && (
          <div className="px-2 pb-2">
            <ul className="space-y-2 divide-y divide-gray-400 pb-2">
              {requestedItems.map((reqItem) => {
                if (requestedItems.includes(!reqItem.id)) return <></>
                return (
                  <SelectedRequestedCard
                    key={reqItem.id}
                    data={reqItem}
                    actions={{
                      primary: { label: 'Edit', cb: handleQuantityChange },
                    }}
                  />
                )
              })}
            </ul>

            <div className="text-end text-sm py-2 bg-gray-200 p-2 rounded shadow">
              <div className="text-sm">
                Total ({requestedItems?.length || 0} requests/
                {totalUnits(requestedItems, 'requested')} units):{' '}
                <span className="font-bold text-xl">
                  ${totalPrice(requestedItems, 'requested').toFixed(2)}
                </span>
              </div>
            </div>

            {/* <div className="py-2 text-center">No items added</div> */}
          </div>
        )}
      </div>
    </div>
  )
}

const SelectedRequestedCard = ({ data = {}, actions = {} }) => {
  const [expanded, setExpanded] = useState(false)
  const item = data.item || {}
  const primary = actions['primary']

  return (
    <div className="mt-2">
      <div className="flex items-stretch gap-2 mb-1">
        <div className="w-1/4 self-center">
          <img
            src={item.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="text-lg leading-5 line-clamp-2 flex-grow-1 flex-shrink-0">
            {item.short_name || 'n/a'}
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
                {item.sku_number || 'n/a'}
              </div>

              <div className="text-xs text-gray-400 truncate">
                {item?.internet_sku_number || 'n/a'}
              </div>

              {/* <div className="text-nowrap font-semibold text-sm">
                <span>Onhand:</span> {item.inventory || 0}
              </div> */}
              <div className="text-nowrap font-semibold text-sm">
                <span>Quantity:</span> {data.requested_quantity}
                <button
                  className="action-link text-xs"
                  onClick={() => primary?.cb(data.id)}
                >
                  {primary.label}
                </button>
              </div>
            </div>

            <div className="flex-1 text-end">
              ${parseFloat(item.item_price || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <button
        className="text-xs  !text-gray-400 mx-auto block  px-5 py-1"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 px-2">
          {data.order_id && (
            <div>
              <span className="font-bold">Order Id: </span>{' '}
              <Link
                to="/orders/$orderId"
                params={{ orderId: data.order_id }}
                className="action-link underline"
              >
                {data.order_id}
              </Link>
            </div>
          )}

          <div>
            <span className="font-bold">Requested by: </span>
            {data.type === 'system'
              ? 'SYSTEM'
              : (data.requester?.username ?? 'n/a')}
          </div>
          {data.evaluator_id && (
            <div>
              <span className="font-bold">Evaluated by: </span>
              {data.evaluator?.username ?? 'n/a'}
            </div>
          )}

          <div>
            <span className="font-bold">Description: </span>
            {item.item_desc}
          </div>
          <div>
            <span className="font-bold">Notes: </span> {data.notes || 'n/a'}
          </div>
        </div>
      )}
    </div>
  )
}

const AddRequestedModal = ({
  supplier,
  selectedIds,
  setSelectedIds,
  closeModal,
}) => {
  const [tempRequestedItems, setTempRequestedItems] = useState(selectedIds)
  const {
    data = {},
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    dataUpdatedAt,
  } = usePaginatedQuery({
    queryKey: ['requested-items', 'paginated', { supplierId: supplier.id }],
    queryFn: () => fetchPaginatedRequests({ supplierId: supplier.id }),
  })

  const itemsData = groupDataArr(data?.items ?? [])
  const totalCount = data?.totalCount ?? 0

  const handleUpdateRequestedItems = () => {
    setSelectedIds(tempRequestedItems || [])
    closeModal()
  }

  return (
    <div className="bg-white rounded p-3 mx-3">
      <div className="mb-3 flex justify-between items-center">
        <h3 className="font-semibold text-xl">
          Requested Items [{supplier.name}]
        </h3>
      </div>
      <div className="space-y-8 max-h-[75lvh] overflow-auto py-4 border-y border-gray-400 px-2">
        {itemsData.map((set, index) => (
          <div key={index}>
            <TitleDivider title={set.label} />
            <div className="space-y-1 divide-y divide-gray-200">
              {/* instead of supplier set, only requested items with date label */}
              {(set.suppliers[0]?.requested_items || []).map((reqItem) => {
                if (reqItem.request_status != 'pending') return null
                return (
                  <PendingRequestedCard
                    key={reqItem.id}
                    data={reqItem}
                    selected={tempRequestedItems.includes(reqItem.id)}
                    setSelectedIds={setTempRequestedItems}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button className="btn flex-1" onClick={closeModal} type="button">
          Close
        </button>
        <button
          className="btn flex-1"
          type="submit"
          onClick={handleUpdateRequestedItems}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

// unused, using prompt for simplicity
const EditQuantityModal = ({ confirmCallback, closeModal, headerCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form>
        <div className="mb-3 flex justify-between items-center">
          <h3 className="font-semibold text-xl">Edit</h3>
          <button className="action-link not-disabled:!text-red-500 !px-0">
            Remove
          </button>
        </div>

        <div className="space-y-1 max-h-[75lvh] overflow-auto py-4 border-y border-gray-400 px-2">
          <label className="mb-0">Requested Quantity</label>
          <input
            type="number"
            name="requested_quantity"
            defaultValue={25}
            className="form-control"
          />
          <span className="text-xs italic">
            *To change default quantity for future orders, go to the product's
            page.
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="btn flex-1" onClick={closeModal} type="button">
            Close
          </button>
          <button className="btn flex-1" type="submit" disabled>
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

const TitleDivider = ({ title, mode = 'days' }) => {
  const formatDaysAgo = (input) => {
    const date = new Date(input)
    if (isNaN(date)) return input // fallback if not a valid date

    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 60) return 'a month ago'
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    if (diffDays < 730) return 'a year ago'

    return `${Math.floor(diffDays / 365)} years ago`
  }
  const displayText = mode === 'days' ? formatDaysAgo(title) : title

  return (
    <div className="mt-3 flex items-center flex-nowrap w-full text-blue-400">
      <div className="flex-grow border-t border-dashed"></div>
      <span className="mx-4">{displayText}</span>
      <div className="flex-grow border-t border-dashed"></div>
    </div>
  )
}
