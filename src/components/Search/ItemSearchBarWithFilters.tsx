import { useQuery } from '@tanstack/react-query'
import { LucideListFilter } from 'lucide-react'
import { useState } from 'react'
import { fetchSuppliers } from '@/api/api'

export default function ItemSearchBarWithFilters({
  originalData,
  setFilteredData,
}) {
  const [expanded, setExpanded] = useState(false)
  let searchTerm = ''
  let searchSupplier = 'all'

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    error,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })

  const filterData = () => {
    setFilteredData((prev) => {
      let filteredData = originalData

      filteredData = filteredData.filter(
        (i) =>
          !searchTerm ||
          i?.short_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      filteredData = filteredData.filter(
        (i) => searchSupplier === 'all' || i?.supplier?.id === searchSupplier,
      )

      return filteredData
    })
  }

  return (
    <div className="mb-2">
      <div className="flex items-center gap-1">
        <input
          type="search"
          className="form-control flex-1"
          placeholder="Search"
          defaultValue={searchTerm}
          onChange={(e) => {
            searchTerm = e.currentTarget.value
            filterData()
          }}
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

      <i className="page-notes">Filtering is purely client-side — no extra server requests are made.</i>

      {expanded && (
        <div className=" space-y-1 px-3 py-2 border border-blue-500 rounded mt-1 shadow-md">
          <span className="text-xs">Filter by supplier</span>
          <select
            name="supplier_filter"
            className="form-control read-only:!bg-white w-full text text-xs cursor-pointer"
            defaultValue={searchSupplier}
            onChange={(e) => {
              searchSupplier = e.currentTarget.value
              filterData()
            }}
          >
            <option value="all">All</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
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
