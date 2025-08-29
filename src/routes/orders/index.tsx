import { deleteOrderMutation, fetchOrders } from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import ProductSearchBarWithFilters from '@/components/ProductSearchBarWithFilters'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideListFilter, LucideMenu } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    data = [],
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
          {/* <button className="action-link">
            Save
          </button> */}
        </div>
        <h2 className="page-title">All Orders</h2>

        {/* BELOW-TITLE OPTIONS */}
        <div
          id="title-buttons"
          className="divide-x mt-6 mb-2 text-nowrap overflow-auto pb-2"
        >
          <Link className="action-link" to="/orders/new">
            New order
          </Link>

          <Link className="action-link disabled" to="/" disabled>
            Dashboard
          </Link>
        </div>

        <ProductSearchBarWithFilters />

        <ul className="divide-y divide-gray-400">
          {data.map((order) => (
            <OrderSetCardRowView data={order} />
          ))}
        </ul>
      </div>
    </>
  )
}

const OrderSetCardRowView = ({ data: order }) => {
  const [optionExpanded, setOptionExpanded] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync: deleteOrder } = useMutation({
    mutationFn: deleteOrderMutation,
    onSuccess: () => queryClient.invalidateQueries(['orders']),
  })

  const handleRemoveOrder = async (e, id) => {
    const btn = e.target
    btn.disabled = true
    try {
      await deleteOrder(id)
    } finally {
      setOptionExpanded(false)
      toast.success('Deleted order')
      btn.disabled = false
    }
  }

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
            {order.supplier?.name || 'undefined'}
          </span>
          <span className="text-gray-500 truncate flex-shrink-0 flex-1/3">
            #{order.external_tracking_number || 'EXT-TRKNO-MISSING'}
          </span>
        </div>
        <div className="text-wrap line-clamp-2 text-lg leading-4 pb-2 mb-2">
          {order.name}
        </div>
        <div className="flex-1/4 mb-1 text-sm">
          <Link
            to="/orders/$orderId"
            params={{ orderId: order.id }}
            className="underline text-blue-500"
          >
            #{order.internal_tracking_number || 'INT-TRKNO-MISSING'}
          </Link>
        </div>
        <div className="flex-1/4 text-sm flex items-center justify-between gap-1">
          <span
            className={`status-${order.status || 'undefined'} font-bold rounded-full px-4 truncate flex-shrink-1 uppercase`}
          >
            {order.status?.replace('-', ' ') || 'undefined'}
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
          className=" p-1.5 ursor-pointer text-black "
          onClick={(e) => {
            e.stopPropagation()
            setOptionExpanded(!optionExpanded)
          }}
        />
        {optionExpanded && (
          <div className="absolute border bg-white shadow p-1 rounded right-full top-0">
            <div className="flex flex-col divide-y divide-gray-400">
              <button
                className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation()
                  setOptionExpanded(false)
                }}
              >
                Update Order
              </button>
              <button
                className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation()
                  setOptionExpanded(false)
                }}
                disabled={order.status === 'approved'}
              >
                Update Deliver
              </button>
              <button
                className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveOrder(e, order.id)
                }}
                disabled={
                  order.status === 'approved' || order.status === 'open-order'
                }
              >
                Delete Order
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
