import {
  addOrderMutation,
  authUser,
  editRequestMutation,
  fetchRequests,
  fetchRequestsFormatted,
  removeOrderMutation,
  showRequest,
} from '@/api/api'
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

const sampleItem = {
  sku_number: 856320,
  internet_sku_number: 100124691,
  item_price: 2.2,
  inventory: -3,
  short_name: '1" EMT Straps 4-Pack',
}

export const Route = createFileRoute('/orders/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { state } = useLocation()

  const { checkedArrIds = [], supplier = {} } = state
  const [checkedArr, setCheckedArr] = useState(checkedArrIds)
  const [pdfOptionExpanded, setPdfOptionExpanded] = useState(false)
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  useEffect(() => {
    document.body.style.overflow = activeModal?.name ? 'hidden' : 'auto'
  }, [activeModal])

  const { mutateAsync: createOrder } = useMutation({
    mutationFn: addOrderMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  const { mutateAsync: deleteOrder } = useMutation({
    mutationFn: removeOrderMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  const closeModal = () => setActiveModal(null)

  const handleSaveAndExport = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = e.nativeEvent.submitter
    btn.disabled = true
    try {
      const { id: newOrderId } = await createOrder({
        name: form.elements['order_name']?.value,
        notes: form.elements['order_notes']?.value,
        created_at: new Date(form.elements['created_at']?.value).toISOString(), // local to UTC
        supplier_id: supplier.id,
        actor_id: authUser.id,
        status: 'await_quote',
      })

      // update the request items to include orderId and change status
      // TODO: track and include the quantity changes
      // IDEA: raised the useQuery to the rootcomponent and track it via states
      try {
        const asyncUpdateRequests = checkedArrIds.map((id) => {
          return editRequestMutation({
            id,
            order_id: newOrderId,
            request_status: 'processing',
            requested_quantity: 20,
            evaluator: authUser.id,
          })
        })
        await Promise.all(asyncUpdateRequests)
        setPdfOptionExpanded(false)
        toast.success('Order ticket created')
        // console.log('Available at: ', `/orders/${newOrderId}`)
        navigate({ to: '/orders/$orderId', params: { orderId: newOrderId } })
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
  // if (isLoading) return <PageLoader />
  // if (error) return <ErrorScreen error={error} />

  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {activeModal.name == 'editRequested' && (
              <EditQuantityModal
                confirmCallback={{}}
                cancelCallback={closeModal}
                headerCallback={{}}
              />
            )}

            {activeModal.name == 'addRequested' && (
              <AddRequestedModal
                supplier={supplier}
                checkedArr={checkedArr}
                setCheckedArr={setCheckedArr}
                cancelCallback={closeModal}
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

        {!checkedArrIds.length ? (
          <div
            role="alert"
            className="relative items-center flex gap-3 rounded border border-red-300/70 bg-red-50 px-4 py-3 text-red-900 shadow"
          >
            <LucideAlertTriangle size={64} />

            <div className="leading-relaxed">
              The selected requested items seems to be empty. Go to{' '}
              <Link
                to="/requests"
                className="font-medium text-red-800 underline underline-offset-4 hover:text-red-900 focus:outline-none focus:ring-red-500/50 "
              >
                /requests
              </Link>{' '}
              to add items to an order.
            </div>
          </div>
        ) : (
          <>
            <form
              id="add-order-form"
              className="space-y-3"
              onSubmit={handleSaveAndExport}
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
                  placeholder={`e.g. ${supplier.name} Order`}
                  defaultValue={`${supplier.name} Order - ${new Date(Date.now()).toDateString()}`}
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

            <div className="flex justify-between mt-10 items-center">
              <div className="font-bold text-sm">Products included:</div>
              {/* <button
                className="action-link text-sm"
                onClick={() => setActiveModal({ name: 'addRequested' })}
              >
                Add requested products
              </button> */}
            </div>

            <div className="space-y-2">
              <SupplierProductSetWithPrice
                supplier={supplier}
                requestedItemsIds={checkedArr}
                setActiveModal={setActiveModal}
              />
            </div>

            <hr className="border-t-6 mt-4 mb-10" />

            <div className="relative">
              <button
                className="btn w-full"
                onClick={() => {
                  setPdfOptionExpanded(!pdfOptionExpanded)
                }}
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

const SupplierProductSetWithPrice = ({
  supplier,
  requestedItemsIds,
  setActiveModal,
}) => {
  const [expanded, setExpanded] = useState(false)
  const {
    data: requestedItemsOriginal = [],
    isLoading,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    queryKey: ['requested-items'],
    queryFn: fetchRequests,
    select: (fetched) =>
      fetched.filter((f) => requestedItemsIds.includes(f.id)),
  })
  const [requestedItems, setRequestedItems] = useState([
    ...requestedItemsOriginal,
  ])
  useEffect(() => {
    setRequestedItems([...requestedItemsOriginal])
  }, [dataUpdatedAt])
  // useEffect(() => {
  //   refetch()
  // }, [requestedItemsIds])

  const totalPrice = (items = []) =>
    items.reduce(
      (sum, { requested_price: p = 0, requested_quantity: q }) => sum + p * q,
      0,
    )

  const totalUnits = (items = []) =>
    items.reduce((sum, { requested_quantity: q }) => sum + q, 0)

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
                ({requestedItemsIds.length || 0} request/s)
              </span>
            )}
          </div>

          <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
        </h3>

        {expanded && (
          <div className="px-2 pb-2">
            <ul className="space-y-2 divide-y divide-gray-400 pb-2">
              {requestedItems.map((item) => (
                <RequestedProductCard
                  key={item.id}
                  data={item}
                  setActiveModal={setActiveModal}
                  setRequestedItems={setRequestedItems}
                />
              ))}
            </ul>

            <div className="text-end text-sm py-2 bg-gray-200 p-2 rounded shadow">
              <div className="text-sm">
                Total ({requestedItems.length || 0} requests/
                {totalUnits(requestedItems)} units):{' '}
                <span className="font-bold text-xl">
                  ${totalPrice(requestedItems).toFixed(2)}
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

// on the supplier set
const RequestedProductCard = ({ data, setActiveModal, setRequestedItems }) => {
  const [expanded, setExpanded] = useState(false)
  const item = data.item || {}

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
                  onClick={() =>
                    // setActiveModal({ name: 'editRequested', data: item })
                    setRequestedItems((prev) => {
                      const newVal = parseInt(prompt('Quantity: '))
                      if (!newVal) return
                      return prev.map((v) =>
                        v.id === data.id
                          ? { ...v, requested_quantity: newVal }
                          : v,
                      )
                    })
                  }
                >
                  Edit
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
        className="text-xs  !text-gray-400 mx-auto block"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 space-y-2 px-2">
          <div>
            <span className="font-bold">Description: </span>
            1-1/4 in. x 1-1/2 in. x 10 ft. Galvanized Steel Drip Edge Flashing
          </div>
          <div>
            <span className="font-bold">Notes: </span> n/a
          </div>
        </div>
      )}
    </div>
  )
}

// on modal => AddRequestedModal
const RequestedItemCard = ({ data, selected: checked, setCheckedArr }) => {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const item = data.item
  return (
    <div className="mt-2">
      <div className="flex items-stretch gap-2 mb-1">
        <label className="w-1/4 self-center" htmlFor={id}>
          <img
            src={item.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </label>
        <label className="w-3/4 flex flex-col" htmlFor={id}>
          <div className="font-bold text-xs text-gray-400 uppercase">
            {data.type || 'n/a'}
          </div>
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

              <div className="text-nowrap font-bold text-sm">
                <span>Onhand:</span> {item.inventory || 0}
              </div>
            </div>

            <div className="flex-1 font-bold text-end">
              ${parseFloat(item.item_price || 0).toFixed(2)}
            </div>
          </div>
        </label>
        <div className="self-center px-1">
          <input
            type="checkbox"
            className="h-5 aspect-square"
            id={id}
            checked={checked}
            onChange={(e) => {
              setCheckedArr((prev) => {
                return !checked
                  ? [...prev, data.id] // add
                  : prev.filter((i) => i != data.id) // subtract
              })
            }}
          />
        </div>
      </div>

      <button
        className="text-xs  !text-gray-400 mx-auto block"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 space-y-2 px-2">
          <div>
            <span className="font-bold">Description: </span>
            1-1/4 in. x 1-1/2 in. x 10 ft. Galvanized Steel Drip Edge Flashing
          </div>
          <div>
            <span className="font-bold">Notes: </span> n/a
          </div>
        </div>
      )}
    </div>
  )
}

const AddRequestedModal = ({
  supplier,
  checkedArr,
  setCheckedArr,
  cancelCallback,
}) => {
  const { data: sameSupplierRequestedItems = [], isLoading } = useQuery({
    queryKey: ['requested-items'],
    queryFn: fetchRequestsFormatted,
    select: (fetched) =>
      fetched.map((set) => ({
        label: set.label,
        items:
          set.suppliers?.find((s) => s.id === supplier.id)?.requested_items ||
          [],
      })),
  })

  return (
    <div className="bg-white rounded p-3 mx-3">
      <div className="mb-3 flex justify-between items-center">
        <h3 className="font-semibold text-xl">
          Requested Items [{supplier.name}]
        </h3>
      </div>
      <div className="space-y-8 max-h-[75lvh] overflow-auto py-4 border-y border-gray-400 px-2">
        {sameSupplierRequestedItems.map((group, index) => (
          <div>
            <TitleDivider title={group.label} key={index} />
            <div className="space-y-1 divide-y divide-gray-200">
              {/* instead of supplier set, only requested items with date label */}
              {(group.items || []).map((item) => (
                <RequestedItemCard
                  data={item}
                  key={item.id}
                  selected={checkedArr.includes(item.id)}
                  setCheckedArr={setCheckedArr}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button className="btn flex-1" onClick={cancelCallback} type="button">
          Close
        </button>
        <button className="btn flex-1" type="submit" disabled>
          Confirm
        </button>
      </div>
    </div>
  )
}

const EditQuantityModal = ({
  confirmCallback,
  cancelCallback,
  headerCallback,
}) => {
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
          <button className="btn flex-1" onClick={cancelCallback} type="button">
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
