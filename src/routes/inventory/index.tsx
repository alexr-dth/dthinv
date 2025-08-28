import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { LucideListFilter } from 'lucide-react'

export const Route = createFileRoute('/inventory/')({
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
        <h2 className="text-2xl text-center mb-3 font-bold">Inventory</h2>

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

        <div className="grid grid-cols-2 gap-3 ">
          <ItemCard data={{}} />
          <ItemCard data={{}} />
          <ItemCard data={{}} />
          <ItemCard data={{}} />
          <ItemCard data={{}} />
          <ItemCard data={{}} />
          <ItemCard data={{}} />
        </div>
      </div>
    </>
  )
}

const ItemCard = ({ data }) => {
  return (
    <div className="rounded border p-2 space-y-2">
      <img
        src="/warehouse.jpg"
        alt=""
        className="w-full aspect-square object-cover"
      />
      <div className="line-clamp-2 leading-4.5">
        Product name asdasdasadsasd sdadas dasasd
      </div>
      <div className="text-sm flex items-center justify-between ">
        <div className="text-nowrap">
          <span className="font-bold">Qty:</span> <span className="">5</span>
        </div>
        <button className="btn w-fit !py-0.5">Add</button>
      </div>
    </div>
  )
}
