import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/orders/$orderId')({
  component: RouteComponent,
  loader: ({ context: { queryClient }, params }) => {
    return {
      orderId: params.orderId,
    }
  },
})

function RouteComponent() {
  const { orderId } = Route.useLoaderData()
  const [pdfOptionExpanded, setPdfOptionExpanded] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ({}),
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
        <h2 className="text-2xl text-center mb-3 font-bold">Order Details</h2>

        <div className="space-y-2">
          <div>
            <span className="font-bold text-sm">Order Name:</span> <br />
            <span> Order made by Jacob Pajunen</span>
          </div>

          <div>
            <span className="font-bold text-sm">Supplier Order Number:</span>{' '}
            <br />
            <span>H0110-345654</span>
          </div>

          <div>
            <span className="font-bold text-sm">Notes:</span> <br />
            <span>N/A</span>
          </div>

          <div>
            <span className="font-bold text-sm">Approver:</span> <br />
            <span>Marvin Martino</span>
          </div>

          <div>
            <span className="font-bold text-sm">Approval Notes:</span> <br />
            <span>N/A</span>
          </div>

          <div>
            <span className="font-bold text-sm">Status:</span> <br />
            <span>Approved</span>
          </div>
        </div>

        <div className="border rounded pb-2 mt-4">
          <h3 className=" p-2   flex justify-between items-center gap-1 border-b-1">
            <span className="text-lg font-semibold uppercase">Home Depot</span>
            <span className="text-xs">(13 items)</span>
          </h3>

          <ul className="space-y-2 divide-y divide-gray-400 px-2">
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
            <ItemNode data={{}} />
          </ul>
        </div>

        <div className="border-t-8 text-end mt-5 pt-2 mb-5">
          <div>
            Total(10 Items): <span className="font-bold">$1000.000</span>
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
