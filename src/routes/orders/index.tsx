import { fetchItems, fetchOrders } from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import ItemSearchBarWithFilters from '@/components/ItemSearchBarWithFilters'
import PageLoader from '@/components/PageLoader'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideMenu } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {activeModal.name == 'editRequested' && <>Modal here</>}
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
          <Link to={'/orders/new'} className="action-link">
            Create Order
          </Link>
        </div>
        <h2 className="page-title">All Orders</h2>
        <div id="title-buttons" className="space-x-1 overflow-auto mb-2">
          <button className="cursor-pointer text-sm px-2 rounded-full border">
            Home Depot
          </button>
          <button className="cursor-pointer text-sm px-2 rounded-full border">
            Hardware Resources
          </button>
          <button className="cursor-pointer text-sm px-2 rounded-full border">
            Amazon
          </button>
        </div>

        <ItemSearchBarWithFilters
          originalData={[]}
          setFilteredData={() => {}}
        />

        <ul className="divide-y-2 divide-gray-400">
          {orders.map((order) => (
            <OrderSetCard data={order} status={'approved'} />
          ))}
        </ul>
      </div>
    </>
  )
}

const OrderSetCard = ({ data: order, status }) => {
  const [optionExpanded, setOptionExpanded] = useState(false)

  const totalPrice = (items = []) =>
    items.reduce(
      (sum, { price = 0, approved_qty }) => sum + price * approved_qty,
      0,
    )

  const totalUnits = (items = []) =>
    items.reduce((sum, { approved_qty }) => sum + approved_qty, 0)

  return (
    <li className="flex items-start gap-2 min-h-30 overflow-visible py-4">
      <div className="truncate self-stretch flex flex-col justify-between flex-1">
        <div className="flex-1/4 text-xs flex">
          <span className="font-bold me-2 truncate ">
            {order.supplier?.name || 'n/a'}
          </span>
          <span className="text-gray-500 truncate flex-shrink-0 flex-1/3">
            {order.supplier_tracking_id || 'NO-SUPPLIER-TRACKING-ID'}
          </span>
        </div>
        <div className="text-wrap line-clamp-2 text-lg leading-5 pb-2 mb-2">
          {order.name || 'n/a'}
        </div>
        <div className="flex-1/4 mb-1 text-sm">
          <Link
            to="/orders/$orderId"
            params={{ orderId: order.id }}
            className="underline text-blue-500"
          >
            #{order.id || 'NO-INTERNAL-TRACKING-YET'}
          </Link>
        </div>
        <div className="flex-1/4 text-sm flex items-center justify-between gap-1">
          <span
            className={`status-badge ${'quote-requested' || 'undefined'} flex-shrink-1`}
          >
            {'quote-requested'.replace('-', ' ') || 'undefined'}
          </span>
          <span className="font-semibold flex-grow-0 flex-shrink-0 w-1/3 truncate text-end">
            ${totalPrice(order.items).toFixed(2) || 'n/a'}
          </span>
        </div>
      </div>
      {/* actions */}
      <div className="ms-auto relative">
        <LucideMenu
          size={32}
          className=" p-1.5 cursor-pointer text-black "
          onClick={(e) => {
            e.stopPropagation()
            setOptionExpanded(!optionExpanded)
          }}
        />
        {optionExpanded && (
          <div className="absolute border bg-white shadow p-1 rounded right-full top-0">
            <div className="flex flex-col divide-y divide-gray-400">
              <Link
                className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                to="/orders/$orderId/edit"
                params={{ orderId: order.id }}
              >
                Update Order
              </Link>
              <button
                className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation()
                  setOptionExpanded(false)
                }}
                disabled={order.status === 'approved'}
              >
                Receive
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
