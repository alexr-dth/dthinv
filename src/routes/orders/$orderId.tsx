import { fetchOrderById } from '@/api/api'
import PageLoader from '@/components/PageLoader'
import { useQuery } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/orders/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = useParams({ from: '/orders/$orderId' })
  const [pdfOptionExpanded, setPdfOptionExpanded] = useState(false)
  const navigate = useNavigate()

  const {
    data = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders', String(orderId)],
    queryFn: () => fetchOrderById(orderId),
  })

  useEffect(() => {
    if (isLoading) return
    if (Object.keys(data).length) return

    toast.error('Order not found')
    navigate({ to: '/orders' })
  }, [isLoading, data, navigate])

  if (isLoading) return <PageLoader />
  if (error) return <p>Something went wrong</p>
  return (
    <>
      <div className="sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3">
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
        <h2 className="text-2xl text-center mb-3 font-bold">Order Details</h2>

        <div className="space-y-2">
          <div>
            <span className="font-bold text-sm">Order Name:</span> <br />
            <span> {data.order_name}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Supplier Order Number:</span>{' '}
            <br />
            <span>#{data.supplier_tracking_number}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Notes:</span> <br />
            <span>{data.notes || 'N/A'}</span>
          </div>

          <hr />

          <div>
            <span className="font-bold text-sm">Approver:</span> <br />
            <span>{data.approver || 'N/A'}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Approval Notes:</span> <br />
            <span>{data.approval_notes || 'N/A'}</span>
          </div>

          <div>
            <span className="font-bold text-sm">Status:</span> <br />
            <span className="uppercase">{data.status?.replace('-', ' ')}</span>
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
          <OrderSet />
          <OrderSet />
          <OrderSet />
          <OrderSet />
        </div>

        <div className="border-t-8 text-end mt-5 pt-2 mb-10">
          <div className="bg-gray-200 p-2 rounded shadow flex items-center justify-end gap-1">
            <span className="text-sm">All Total (10 Items):</span>
            <span className="font-bold text-xl">$123.00</span>
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

const ItemNode = ({ data }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="pt-2  min-h-30 ">
      <div className="flex items-stretch gap-2 mb-2">
        <img
          src="/warehouse.jpg"
          alt=""
          className="aspect-square max-w-20 object-contain"
        />
        <div className="flex flex-col flex-1 ">
          <div className="flex-grow-1">SKU: 202092675</div>
          <div className="flex-grow-1">$5.98</div>

          <div className="mt-auto flex justify-between items-center text-xs">
            <span className="font-bold">Requested Qty: 26</span>
          </div>
          <div className="mt-auto flex justify-between items-center text-xs">
            <span className="font-bold">Approved Qty: 26</span>
            <span className="font-bold">$5.98</span>
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
            <span className="font-bold">Notes: </span> N/A
          </div>
        </div>
      )}
    </li>
  )
}

const OrderSet = () => {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <div className="border rounded">
        <h3
          className={` p-2 flex items-center gap-1 ${expanded && 'border-b-1'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-lg font-semibold uppercase">
            {'Home Depot'}
          </span>
          <span className="text-xs">(13 items)</span>
          <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
        </h3>

        {expanded && (
          <ul className="space-y-2 divide-y divide-gray-400 px-2 pb-2">
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <li className="text-end text-sm py-2 bg-gray-200 p-2 rounded shadow">
              Total (10 Items): <span className="font-bold">$123.00</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}
