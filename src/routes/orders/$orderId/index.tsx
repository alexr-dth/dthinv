import { fetchOrderById } from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import totalPrice from '@/utils/totalPrice'
import totalUnits from '@/utils/totalUnits'
import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/orders/$orderId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = useParams({ from: '/orders/$orderId/' })
  const navigate = useNavigate()

  const [pdfOptionExpanded, setPdfOptionExpanded] = useState(false)
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const {
    data: order = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => fetchOrderById(orderId),
  })

  useEffect(() => {
    if (isLoading || Object.keys(order).length) return
    toast.error('Order not found')
    navigate({ to: '/orders' })
  }, [isLoading, order, navigate])

  const handleExport = async (e, type) => {
    e.preventDefault()
    const btn = e.target
    btn.disabled = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      throw new Error()
      // create a pdf here and downlaod it

      setPdfOptionExpanded(false)
      toast.success('Order ticket created')
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
          <Link
            to="/orders/$orderId/edit"
            params={{ orderId }}
            className="action-link !ps-0"
          >
            Update Quote
          </Link>
        </div>

        <h2 className="page-title">Order Details</h2>

        <div className="space-y-3">
          <div>
            <span className="font-bold text-sm">Ordered by:</span> <br />
            <span className="text-lg w-full ">
              {order.actor?.username || 'n/a'}
            </span>
          </div>

          <div>
            <span className="font-bold text-sm">Date:</span> <br />
            <input
              name="created_at"
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
            <span className="text-lg w-full">{order.name || 'n/a'}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Notes:</span> <br />
            <span className="text-lg w-full">{order.notes || 'n/a'}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Supplier Order Number:</span>{' '}
            <br />
            <span className="text-lg w-full">
              {order.supplier_tracking_id || 'n/a'}
            </span>
          </div>

          <div>
            <span className="font-bold text-sm">Status:</span> <br />
            <span className={`status-badge ${order.status} flex-shrink-1`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="font-bold text-sm mt-10">Products included:</div>
        <div className="space-y-2">
          <SupplierProductSetWithPrice
            requestedItems={order.requested_items}
            supplier={order.supplier}
          />
        </div>

        <div className="border-t-8 text-end mt-5 pt-2 mb-10"></div>

        <div className="relative">
          <button
            className="btn w-full"
            onClick={() => setPdfOptionExpanded(!pdfOptionExpanded)}
          >
            Export to PDF
          </button>

          {pdfOptionExpanded && (
            <div className="absolute border bg-white shadow rounded p-1 left-0 bottom-[110%] w-full">
              <div className="flex flex-col divide-y divide-gray-400">
                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    handleExport(e, 'internal_english')
                  }}
                >
                  Internal (English)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    handleExport(e, 'internal_chinese')
                  }}
                >
                  Internal (Chinese)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    handleExport(e, 'external_english')
                  }}
                >
                  External (English)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    handleExport(e, 'external_internal')
                  }}
                >
                  External (Chinese)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const SupplierProductSetWithPrice = ({ supplier, requestedItems }) => {
  const [expanded, setExpanded] = useState(false)

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
                ({requestedItems.length || 0} request/s)
              </span>
            )}
          </div>

          <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
        </h3>

        <div className={`px-2 pb-2 ${!expanded && `hidden`}`}>
          <ul className="space-y-2 divide-y divide-gray-400 pb-2">
            {requestedItems.map((rItem) => (
              <RequestedProductProcessingCard key={rItem.id} data={rItem} />
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
      </div>
    </div>
  )
}

const RequestedProductProcessingCard = ({ data }) => {
  const [expanded, setExpanded] = useState(false)
  const item = data.item || {}
  console.log(data)
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
              <div
                className={
                  !data.is_quoted
                    ? 'text-gray-500'
                    : 'text-blue-800 font-semibold'
                }
              >
                {data.quoted_quantity} {!data.is_quoted && <span>??</span>}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold">Quoted Price</label>
              <div
                className={
                  !data.is_quoted
                    ? 'text-gray-500'
                    : 'text-blue-800 font-semibold'
                }
              >
                ${data.quoted_price.toFixed(2)}{' '}
                {!data.is_quoted && <span>??</span>}
              </div>
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
