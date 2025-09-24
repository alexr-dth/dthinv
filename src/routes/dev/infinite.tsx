import { fetchPaginatedItems } from '@/api/api'
import ItemSearchBarWithFilters from '@/components/ItemSearchBarWithFilters'
import usePaginatedQuery from '@/hooks/usePaginatedQuery'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import axios from 'axios'
import { useState } from 'react'

export const Route = createFileRoute('/dev/infinite')({
  component: RouteComponent,
})

function RouteComponent() {
  const enabled = false
  if (!enabled) {
    return <Navigate to="/disabled" replace />
  }

  const [filteredData, setFilteredData] = useState([])

  const {
    data = {},
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    dataUpdatedAt,
  } = usePaginatedQuery({ queryKey: ['items'], queryFn: fetchPaginatedItems })

  const itemsData = data?.items ?? []
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setFilteredData(itemsData)
  }, [dataUpdatedAt])

  if (isLoading) return <p>Loading…</p>
  if (error) return <p>Failed to load</p>

  return (
    <div>
      <ItemSearchBarWithFilters originalData={itemsData} setFilteredData={setFilteredData} />
      <div>
        {filteredData.map((item) => (
          <div key={item.id} className="">
            {item.id}
          </div>
        ))}
      </div>

      <div className="mt-5 text-center mb-5">
        <div className="text-xs mb-4 font-light text-gray-400">
          Showing {filteredData.length} of {totalCount} items
        </div>
        {hasNextPage && (
          <button
            className="action-link"
            disabled={isFetching}
            onClick={() => fetchNextPage()}
          >
            Load More...
          </button>
        )}
      </div>
    </div>
  )
}
