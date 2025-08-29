import { fetchOrderById } from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/orders/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = useParams({ from: '/orders/$orderId' })
  const [pdfOptionExpanded, setPdfOptionExpanded] = useState(false)
  const navigate = useNavigate()

  const {
    data: order = {},
    isLoading,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['orders', String(orderId)],
    queryFn: () => fetchOrderById(orderId),
  })

  const buildOrderSet = ({ items = [] }) => {
    return Object.values(
      items.reduce((acc, { supplier, ...rest }) => {
        ;(acc[supplier.id] ??= { supplier, items: [] }).items.push(rest)
        return acc
      }, {}),
    )
  }

  const orderSets = useMemo(() => buildOrderSet(order), [order, dataUpdatedAt])

  useEffect(() => {
    if (isLoading) return
    if (Object.keys(order).length) return

    toast.error('Order not found')
    navigate({ to: '/orders' })
  }, [isLoading, order, navigate])

  const totalPrice = (items = []) =>
    items.reduce(
      (sum, { price = 0, approved_qty }) => sum + price * approved_qty,
      0,
    )

  const totalUnits = (items = []) =>
    items.reduce((sum, { approved_qty }) => sum + approved_qty, 0)

  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      <div className="sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3">
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
          <Link to="/" className="action-link">
            Update
          </Link>
        </div>

        <h2 className="page-title">Order Details</h2>

        <div className="space-y-2">
          <div>
            <span className="font-bold text-sm">Order Name:</span> <br />
            <span>{order.name || 'n/a'}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Supplier Order Number:</span>{' '}
            <br />
            <span>
              #{order.external_tracking_number || 'EXT-TRKNO-MISSING'}
            </span>
          </div>

          <div>
            <span className="font-bold text-sm">Requester:</span> <br />
            <span>{order.requester?.name || 'n/a'}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Notes:</span> <br />
            <span>{order.requester_notes || 'n/a'}</span>
          </div>

          <hr />

          <div>
            <span className="font-bold text-sm">Approver:</span> <br />
            <span>{order.approver?.name || 'n/a'}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Notes:</span> <br />
            <span>{order.approval_notes || 'n/a'}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Status:</span> <br />
            <span
              className={`status-${order.status} font-bold rounded-full px-4 truncate flex-shrink-1 uppercase`}
            >
              {order.status?.replace('-', ' ')}
            </span>
          </div>
        </div>

        <button
          className="action-link underline text-xs text-end w-full block mb-1"
          onClick={() => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'smooth',
            })
          }}
        >
          see total
        </button>

        <div className="space-y-2">
          {orderSets.map((set) => (
            <OrderSet set={set} />
          ))}
        </div>

        <div className="border-t-8 text-end mt-5 pt-2 mb-10">
          <div className="bg-blue-100 p-2 rounded shadow flex items-center justify-end gap-1">
            <div className="text-end text-sm py-2 ">
              Total ({order.items.length || 0} types/{totalUnits(order.items)}{' '}
              units):{' '}
              <span className="font-bold text-xl">
                ${totalPrice(order.items).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

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
                  className="text-lg py-1 px-3 text-black text-nowrap"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPdfOptionExpanded(false)
                    // setActiveModal({ name: 'locationImage', data: node })
                  }}
                >
                  Internal (English)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPdfOptionExpanded(false)
                    // setActiveModal({ name: 'locationImage', data: node })
                  }}
                >
                  Internal (Chinese)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPdfOptionExpanded(false)
                    // setActiveModal({ name: 'locationImage', data: node })
                  }}
                >
                  External (English)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPdfOptionExpanded(false)
                    // setActiveModal({ name: 'locationImage', data: node })
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

const OrderSetItems = ({ data: item }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <li className="pt-2 min-h-30 ">
      <div className="flex items-stretch gap-2 mb-2">
        <img
          src={item?.image || '/missing.jpg'}
          alt=""
          className="w-1/4 object-contain"
        />
        <div className="w-3/4 flex flex-col">
          <div className="text-lg leading-5 line-clamp-2 flex-grow-1 flex-shrink-0">
            {item?.name}
          </div>

          <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
            {item.external_sku}
          </div>

          <div className="text-sm mb-2">${item.price}</div>

          <div className="flex justify-between gap-3">
            <div>
              <div className="text-xs flex-grow-0 truncate mb-0 text-gray-500">
                Requested Qty: {item.requested_qty}
              </div>
              <div className="text-xs flex-grow-0 truncate font-semibold">
                Approved Qty: {item.approved_qty}
              </div>
            </div>
            <div className="font-bold truncate">
              ${(item.approved_qty * item.price).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      <button
        className="text-blue-500 text-xs underline"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide' : 'More'}
      </button>
      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 space-y-2">
          <div>
            <span className="font-bold">Description: </span>
            1-1/4 in. x 1-1/2 in. x 10 ft. Galvanized Steel Drip Edge Flashing
          </div>
          <div>
            <span className="font-bold">Notes: </span> n/a
          </div>
        </div>
      )}
    </li>
  )
}

const OrderSet = ({ set }) => {
  const [expanded, setExpanded] = useState(false)
  const totalPrice = (items = []) =>
    items.reduce(
      (sum, { price = 0, approved_qty }) => sum + price * approved_qty,
      0,
    )

  const totalUnits = (items = []) =>
    items.reduce((sum, { approved_qty }) => sum + approved_qty, 0)

  return (
    <div>
      <div className="border rounded">
        <h3
          className={` p-2 flex items-center gap-1 ${expanded && 'border-b-1'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <h5 className="text-lg font-semibold uppercase">
              {set.supplier?.name || 'n/a'}
            </h5>
            {!expanded && (
              <span className="text-sm text-gray-500">
                ${totalPrice(set.items).toFixed(2)}{' '}
                <span className="text-xs">
                  ({set.items.length || 0} types/{totalUnits(set.items)} units)
                </span>
              </span>
            )}
          </div>

          <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
        </h3>

        {expanded && (
          <ul className="space-y-2 divide-y divide-gray-400 px-2 pb-2">
            {set.items.map((item) => (
              <OrderSetItems data={item} />
            ))}

            <li className="text-end text-sm py-2 bg-gray-200 p-2 rounded shadow">
              Total ({set.items.length || 0} types/{totalUnits(set.items)}{' '}
              units):
              <span className="font-bold">
                ${totalPrice(set.items).toFixed(2)}
              </span>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}
