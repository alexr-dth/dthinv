import {
  editOrderMutation,
  editRequestMutation,
  fetchOrderById,
} from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/orders/$orderId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = useParams({ from: '/orders/$orderId/edit' })
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // const [pdfOptionExpanded, setPdfOptionExpanded] = useState(false)
  // const [activeModal, setActiveModal] = useState<{
  //   name: string
  //   data?: any
  // } | null>(null)
  const {
    data: order = {},
    isLoading,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => fetchOrderById(orderId),
  })
  const [requestedItems, setRequestedItems] = useState([])
  useEffect(() => {
    setRequestedItems(order.requested_items || [])
  }, [dataUpdatedAt])

  useEffect(() => {
    if (isLoading || Object.keys(order).length) return
    toast.error('Order not found')
    navigate({ to: '/orders' })
  }, [isLoading, order, navigate])

  const { mutateAsync: patchOrder } = useMutation({
    mutationFn: editOrderMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  const handleUpdate = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = e.nativeEvent.submitter
    btn.disabled = true
    try {
      await patchOrder({
        id: order.id,
        name: form.elements['order_name']?.value,
        notes: form.elements['order_notes']?.value,
        supplier_tracking_id: form.elements['order_tracking_number']?.value,
        status: form.elements['order_status']?.value,
      })
      toast.success('Order updated')

      const asyncUpdateRequests = requestedItems.map((r) => {
        return editRequestMutation({
          id: r.id,
          quoted_quantity: r.quoted_quantity,
          quoted_price: r.quoted_price,
        })
      })
      await Promise.all(asyncUpdateRequests)
      toast.success('Items updated')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
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

        <h2 className="page-title">Edit Details</h2>

        <form
          id="update-order-form"
          onSubmit={handleUpdate}
          className="space-y-3"
        >
          <div>
            <span className="font-bold text-sm">Ordered by:</span> <br />
            <input
              type="text"
              className="text-lg w-full pointer-events-none"
              defaultValue={order.actor?.username || 'n/a'}
              readOnly
            />
          </div>

          <div>
            <span className="font-bold text-sm">Date:</span> <br />
            <input
              type="datetime-local"
              className="text-lg w-full pointer-events-none"
              value={new Date(order.created_at)
                .toLocaleString('sv-SE')
                .replace(' ', 'T')}
              readOnly
            />
          </div>

          <div>
            <span className="font-bold text-sm">Order name:</span> <br />
            <input
              name="order_name"
              type="text"
              className="form-control-bare w-full text-lg"
              placeholder={`e.g. ${order.supplier.name} Order`}
              defaultValue={order.name}
            />
          </div>

          <div>
            <span className="font-bold text-sm">Notes:</span> <br />
            <textarea
              name="order_notes"
              className="form-control-bare w-full text-lg"
              rows={2}
              placeholder="Add remarks..."
              defaultValue={order.notes}
            />
          </div>

          <div>
            <span className="font-bold text-sm">Supplier Order Number:</span>{' '}
            <br />
            <input
              name="order_tracking_number"
              type="text"
              className="form-control-bare w-full text-lg"
              placeholder="e.g. 123456789012"
              defaultValue={order.supplier_tracking_id}
            />
          </div>

          <div>
            <span className="font-bold text-sm">Status:</span> <br />
            <select name="order_status" className="form-control min-w-1/2">
              <option value="await_quote">await_quote</option>
              <option value="await_deliver">await_deliver</option>
              <option value="fulfilled_complete">fulfilled_complete</option>
              <option value="fulfilled_missing">fulfilled_missing</option>
            </select>
          </div>
        </form>

        <div className="font-bold text-sm mt-10">Products included:</div>
        <div className="space-y-2">
          <SupplierProductSetWithPrice
            supplier={order.supplier}
            productList={requestedItems}
            editRequestedItem={setRequestedItems}
          />
        </div>

        <div className="border-t-8 text-end mt-5 pt-2 mb-10"></div>

        <button className="btn w-full" form="update-order-form">
          Update
        </button>
      </div>
    </>
  )
}

const SupplierProductSetWithPrice = ({
  supplier,
  productList,
  editRequestedItem,
}) => {
  const [expanded, setExpanded] = useState(true)

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
          className={` p-2 flex items-center gap-1 ${expanded && `border-b-1`}`}
          // onClick={() => setExpanded(!expanded)}
        >
          <div>
            <h5 className="text-lg font-semibold uppercase">{supplier.name}</h5>
            {!expanded && (
              <span className="text-xs text-gray-500">
                ({productList.length || 0} request/s)
              </span>
            )}
          </div>

          {/* <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span> */}
        </h3>

        <div className={`px-2 pb-2 ${!expanded && `hidden`}`}>
          <ul className="space-y-2 divide-y divide-gray-400 pb-2">
            {productList.map((item) => (
              <RequestedProductUpdateCard
                key={item.id}
                data={item}
                editRequestedItem={editRequestedItem}
              />
            ))}
          </ul>

          <div className="text-end text-sm py-2 bg-gray-200 p-2 rounded shadow">
            <div className="text-sm">
              Total ({productList.length || 0} requests/
              {totalUnits(productList)} units):{' '}
              <span className="font-bold text-xl">
                ${totalPrice(productList).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RequestedProductUpdateCard = ({ data, editRequestedItem }) => {
  const [expanded, setExpanded] = useState(false)
  const item = data.item || {}
  return (
    <div className="mt-2">
      <div className="flex items-stretch gap-2 mb-1 ">
        <div className="w-1/4 self-center">
          <img
            src={item.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="text-lg leading-5 line-clamp-2 flex-shrink-0">
            {item.short_name || 'n/a'}
          </div>

          <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
            {item.sku_number || 'n/a'}
          </div>

          <div className="text-xs text-gray-400 truncate">
            {item?.internet_sku_number || 'n/a'}
          </div>

          <div className="flex [&>div]:flex-1 gap-3">
            <div>
              <label className="text-xs font-bold">Requested Qty</label>
              <div>{data.requested_quantity}</div>
            </div>
            <div>
              <label className="text-xs font-bold">Requested Price</label>
              <div>${data.requested_price.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex [&>div]:flex-1 gap-3">
            <div>
              <label className="text-xs font-bold">Quoted Qty</label>
              <input
                type="number"
                className="w-full text-lg ps-1 focus:outline-0 border-b"
                defaultValue={
                  data.quoted_quantity
                    ? data.quoted_quantity
                    : data.requested_quantity
                }
                onChange={(e) =>
                  editRequestedItem((prev) =>
                    (prev || []).map((i) =>
                      i.id !== data.id
                        ? i
                        : { ...i, quoted_quantity: e.target.value },
                    ),
                  )
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold">Quoted Price</label>
              <input
                type="number"
                className="w-full text-lg ps-1 focus:outline-0 border-b"
                defaultValue={
                  data.quoted_price
                    ? data.quoted_price
                    : data.requested_price || 0
                }
                onChange={(e) =>
                  editRequestedItem((prev) =>
                    (prev || []).map((i) =>
                      i.id !== data.id
                        ? i
                        : { ...i, quoted_price: e.target.value },
                    ),
                  )
                }
              />
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
