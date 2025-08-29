import { LucideListFilter } from 'lucide-react'
import { useState } from 'react'

export default function ProductSearchBarWithFilters() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1 ">
        <input
          type="search"
          className="form-control flex-1"
          placeholder="Search"
        />
        <div className="">
          <LucideListFilter
            size={42}
            className="bg-white p-0.5 rounded border cursor-pointer text-black shadow"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          />
        </div>
      </div>
      {expanded && (
        <div className=" space-y-1 px-3">
          <span className="text-xs">Filter by supplier</span>
          <select
            name="supplier_filter"
            className="form-control read-only:!bg-white w-full text"
          >
            <option value="all">All</option>
            <option value="home_depot">Home Depot</option>
            <option value="amazon">Amazon</option>
            <option value="hardware_resources">Hardware Resources</option>
            <option value="paint">PAINT</option>
          </select>

          <div className="flex justify-between gap-1">
            <div className="flex w-1/2 items-center gap-1">
              <input
                id="filter_1"
                type="checkbox"
                name=""
                className="w-4 aspect-square"
              />
              <label htmlFor="filter_1" className="truncate">
                Filter 1
              </label>
            </div>

            <div className="flex w-1/2 items-center gap-1">
              <input
                id="filter_2"
                type="checkbox"
                name=""
                className="w-4 aspect-square"
              />
              <label htmlFor="filter_2" className="truncate">
                Filter 2
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-1">
            <div className="flex w-1/2 items-center gap-1">
              <input
                id="filter_3"
                type="checkbox"
                name=""
                className="w-4 aspect-square"
              />
              <label htmlFor="filter_3" className="truncate">
                Filter 3
              </label>
            </div>

            <div className="flex w-1/2 items-center gap-1">
              <input
                id="filter_4"
                type="checkbox"
                name=""
                className="w-4 aspect-square"
              />
              <label htmlFor="filter_4" className="truncate">
                Filter 4
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
