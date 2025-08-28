import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideListFilter, LucideMenu } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
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
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
          <OrderListNode data={{}} />
        </ul>
      </div>
    </>
  )
}

const OrderListNode = ({ data }) => {
  const [optionExpanded, setOptionExpanded] = useState(false)
  return (
    <li className="flex items-start gap-2 min-h-30 overflow-visible py-4">
      <div className="truncate self-stretch flex flex-col justify-between flex-1">
        <div className="flex-1/4 text-xs flex">
          <span className="font-bold me-2 truncate ">Home Depot</span>
          <span className="text-gray-500 truncate flex-shrink-0 flex-1/3">
            #H0110-345654
          </span>
        </div>
        <div className="text-wrap line-clamp-2 text-lg leading-4 pb-2 mb-2">
          Order made by Jacob Pajunen
        </div>
        <div className="flex-1/4 mb-1 text-sm">
          <Link
            to="/orders/$orderId"
            params={{ orderId: '2113123' }}
            className="underline text-blue-500"
          >
            #2113123
          </Link>
        </div>
        <div className="flex-1/4 text-sm flex items-center justify-between gap-1">
          <span className="bg-green-200 text-green-900 font-semibold rounded-full px-4 truncate flex-shrink-1">
            Open Order
          </span>
          <span className="font-semibold flex-grow-0 flex-shrink-0 w-1/3 truncate text-end">
            $740.16
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
                className="text-lg py-1 px-3 text-black text-nowrap"
                onClick={(e) => {
                  e.stopPropagation()
                  setOptionExpanded(false)
                  // setActiveModal({ name: 'locationImage', data: node })
                }}
              >
                Update Order
              </button>
              <button
                className="text-lg py-1 px-3 text-black text-nowrap"
                onClick={(e) => {
                  e.stopPropagation()
                  setOptionExpanded(false)
                  // setActiveModal({ name: 'locationBarcode', data: node })
                }}
              >
                Update Deliver
              </button>
              <button
                className="text-lg py-1 px-3 text-black text-nowrap"
                onClick={(e) => {
                  e.stopPropagation()
                  setOptionExpanded(false)
                  // setActiveModal({ name: 'editLocation', data: node })
                }}
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
