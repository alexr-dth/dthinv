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
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['orders', String(orderId)],
    queryFn: () => fetchOrderById(orderId),
  })

  // const buildOrderSet = ({ items = [] }) => {
  //   return Object.values(
  //     items.reduce((acc, { supplier, ...rest }) => {
  //       ;(acc[supplier.id] ??= { supplier, items: [] }).items.push(rest)
  //       return acc
  //     }, {}),
  //   )
  // }

  // const orderSets = useMemo(() => buildOrderSet(order), [order, dataUpdatedAt])

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

  const handleSaveAndExport = async (e, type) => {
    e.preventDefault()
    const btn = e.target
    btn.disabled = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      throw new Error()

      toast.success('Order ticket created')
      setPdfOptionExpanded(false)
    } catch (e) {
      toast.error('Error creating order ticket')
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
            params={{ orderId: 101 }}
            className="action-link !ps-0"
          >
            Update
          </Link>
        </div>

        <h2 className="page-title">Order Details</h2>

        <div className="space-y-3">
          <div>
            <span className="font-bold text-sm">Ordered by:</span> <br />
            <span className="text-lg w-full ">Clark Kent</span>
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
            <span className="text-lg w-full">
              Additional supplies for Project DTH-101.
            </span>
          </div>

          <div>
            <span className="font-bold text-sm">Notes:</span> <br />
            <span className="text-lg w-full">n/a</span>
          </div>

          <div>
            <span className="font-bold text-sm">Supplier Order Number:</span>{' '}
            <br />
            <span className="text-lg w-full">EXT-TRKNO-MISSING</span>
          </div>

          <div>
            <span className="font-bold text-sm">Status:</span> <br />
            <span
              className={`status-badge ${'quote-requested' || 'undefined'} flex-shrink-1`}
            >
              {'quote-requested'.replace('-', ' ') || 'undefined'}
            </span>
          </div>
        </div>

        <div className="font-bold text-sm mt-10">Products included:</div>
        <div className="space-y-2">
          <SupplierProductSet
            set={{}}
            supplierName={'Home Depot'}
            setActiveModal={setActiveModal}
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
                    handleSaveAndExport(e, 'internal_english')
                  }}
                >
                  Internal (English)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    handleSaveAndExport(e, 'internal_chinese')
                  }}
                >
                  Internal (Chinese)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    handleSaveAndExport(e, 'external_english')
                  }}
                >
                  External (English)
                </button>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    handleSaveAndExport(e, 'external_internal')
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
          onClick={() => setExpanded(!expanded)}
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

        {expanded && (
          <div className={`px-2 pb-2`}>
            <ul className="space-y-2 divide-y divide-gray-400 pb-2">
              <RequestedCard
                data={sampleItem}
                setActiveModal={setActiveModal}
              />

              <RequestedCard
                data={sampleItem}
                setActiveModal={setActiveModal}
              />

              <RequestedCard
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
        )}
      </div>
    </div>
  )
}

const RequestedCard = ({ data: item, setActiveModal }) => {
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
              <div className='text-gray-500'>25</div>
            </div>
            <div>
              <label className="text-xs font-bold">Quoted Price</label>
              <div className='text-gray-500'>$21.59</div>
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
