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

const sampleItem = {
  sku_number: 856320,
  internet_sku_number: 100124691,
  item_price: 2.2,
  inventory: -3,
  short_name: '1" EMT Straps 4-Pack',
}

export const Route = createFileRoute('/orders/$orderId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orderId } = useParams({ from: '/orders/$orderId/edit' })
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

        <div className="space-y-3">
          <div>
            <span className="font-bold text-sm">Ordered by:</span> <br />
            <input
              name="ordered_by"
              type="text"
              className="text-lg w-full pointer-events-none"
              value={'Clark Kent'}
            />
          </div>

          <div>
            <span className="font-bold text-sm">Date:</span> <br />
            <input
              name="created_at"
              type="datetime-local"
              className="text-lg w-full pointer-events-none"
              defaultValue={new Date(
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
              placeholder="e.g. Warehouse Supplies Order"
              defaultValue={'Additional supplies for Project DTH-101.'}
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

          <div>
            <span className="font-bold text-sm">Supplier Order Number:</span>{' '}
            <br />
            <input
              type="text"
              className="form-control-bare w-full text-lg"
              placeholder="e.g. 123456789012"
              defaultValue={'EXT-TRKNO-MISSING'}
            />
          </div>

          <div>
            <span className="font-bold text-sm">Status:</span> <br />
            <select
              name="orderStatus"
              id="orderStatus"
              className="form-control w-1/2"
            >
              <option value="awaitingQuote">Quote Requested</option>
              <option value="awaitingDelivery">Awaiting Delivery</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        <div className="font-bold text-sm mt-10">Products included:</div>
        <div className="space-y-2">
          <SupplierProductSet
            set={{}}
            supplierName={'Home Depot'}
            setActiveModal={{}}
          />
        </div>

        <div className="border-t-8 text-end mt-5 pt-2 mb-10">
        </div>

        <button className="btn w-full">Update</button>
      </div>
    </>
  )
}

const SupplierProductSet = ({ set, supplierName, setActiveModal }) => {
  const [expanded, setExpanded] = useState(true)
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
          className={` p-2 flex items-center gap-1 ${expanded && `border-b-1`}`}
          // onClick={() => setExpanded(!expanded)}
        >
          <div>
            <h5 className="text-lg font-semibold uppercase">{supplierName}</h5>
            {!expanded && (
              <span className="text-sm text-gray-500">
                $5000 <span className="text-xs">(20 types/30 units)</span>
              </span>
            )}
          </div>

          <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
        </h3>

        <div className={`px-2 pb-2 ${!expanded && `hidden`}`}>
          <ul className="space-y-2 divide-y divide-gray-400 pb-2">
            <RequestedUpdateCard
              data={sampleItem}
              setActiveModal={setActiveModal}
            />

            <RequestedUpdateCard
              data={sampleItem}
              setActiveModal={setActiveModal}
            />

            <RequestedUpdateCard
              data={sampleItem}
              setActiveModal={setActiveModal}
            />
          </ul>

          <div className="text-end text-sm py-2 bg-gray-200 p-2 rounded shadow">
            <div className="text-sm">
              Total (2 types/10 units):{' '}
              <span className="font-bold text-xl">$5000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RequestedUpdateCard = ({ data: item, setActiveModal }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="mt-2">
      <div className="flex items-stretch gap-2 mb-1 ">
        <div className="w-1/4 self-center">
          <img src={'/pliers.jpg'} alt="" className="object-contain" />
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
              <div>25</div>
            </div>
            <div>
              <label className="text-xs font-bold">Requested Price</label>
              <div>$21.59</div>
            </div>
          </div>

          <div className="flex [&>div]:flex-1 gap-3">
            <div>
              <label className="text-xs font-bold">Quoted Qty</label>
              <input
                type="number"
                className="w-full text-lg ps-1 focus:outline-0 border-b"
                defaultValue={25}
              />
            </div>
            <div>
              <label className="text-xs font-bold">Quoted Price</label>
              <input
                type="number"
                className="w-full text-lg ps-1 focus:outline-0 border-b"
                defaultValue={21.59}
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
