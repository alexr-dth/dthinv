import { deleteOrderMutation, fetchOrders } from '@/api/api'
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

  if (isLoading) return <p>Loading user...</p>
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
        <h2 className="text-2xl text-center mb-3 font-bold">All Orders</h2>

        <div className="divide-x mt-6 mb-2 text-nowrap overflow-auto pb-2">
          <Link className="action-link disabled" to="/" disabled>
            Dashboard
          </Link>
          <Link className="action-link" to="/orders/new">
            New order
          </Link>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <input
            type="text"
            className="form-control flex-1"
            placeholder="Search"
          />
          <div className="">
            <LucideListFilter
              size={42}
              className="bg-white p-0.5 rounded border cursor-pointer text-black shadow"
              onClick={(e) => {
                e.stopPropagation()
                setOptionExpanded(!optionExpanded)
              }}
            />
          </div>
        </div>

        <ul className=" divide-y divide-gray-400">
          {data.map((order) => (
            <OrderListNode data={order} />
          ))}
        </ul>
      </div>
    </>
  )
}

const OrderListNode = ({ data }) => {
  const queryClient = useQueryClient()

  const [optionExpanded, setOptionExpanded] = useState(false)

  const { mutateAsync: deleteOrder } = useMutation({
    mutationFn: deleteOrderMutation,
    onSuccess: () => queryClient.invalidateQueries(['orders']),
  })

  const removeOrder = async (e, id) => {
    const btn = e.target
    btn.disabled = true
    try {
      await deleteOrder(id)
    } finally {
      toast.success('Deleted order')
      setOptionExpanded(false)
      btn.disabled = false
    }
  }

  return (
    <li className="flex items-start gap-2 min-h-30 overflow-visible py-4">
      <div className="truncate self-stretch flex flex-col justify-between flex-1">
        <div className="flex-1/4 text-xs flex">
          <span className="font-bold me-2 truncate ">{data.supplier}</span>
          <span className="text-gray-500 truncate flex-shrink-0 flex-1/3">
            #{data.supplier_tracking_number}
          </span>
        </div>
        <div className="text-wrap line-clamp-2 text-lg leading-4 pb-2 mb-2">
          {data.order_name}
        </div>
        <div className="flex-1/4 mb-1 text-sm">
          <Link
            to="/orders/$orderId"
            params={{ orderId: data.id }}
            className="underline text-blue-500"
          >
            #{data.internal_tracking_number}
          </Link>
        </div>
        <div className="flex-1/4 text-sm flex items-center justify-between gap-1">
          <span
            className={`status-${data.status || 'undefined'} font-bold rounded-full px-4 truncate flex-shrink-1 uppercase`}
          >
            {data.status?.replace('-', ' ') || 'undefined'}
          </span>
          <span className="font-semibold flex-grow-0 flex-shrink-0 w-1/3 truncate text-end">
            ${data.total_price}
          </span>
        </div>
      </div>
      {/* actions */}
      <div className="ms-auto relative">
        <LucideMenu
          size={32}
          className="bg-white p-0.5 rounded border cursor-pointer text-black shadow"
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
                  // setActiveModal({ name: 'locationImage', data: node })
                }}
              >
                Update Order
              </button>
              <button
                className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation()
                  setOptionExpanded(false)

                  // setActiveModal({ name: 'locationBarcode', data: node })
                }}
                disabled={data.status === 'approved'}
              >
                Update Deliver
              </button>
              <button
                className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation()
                  removeOrder(e, data.id)
                }}
                disabled={
                  data.status === 'approved' || data.status === 'open-order'
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
