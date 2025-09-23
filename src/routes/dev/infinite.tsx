import { fetchPaginatedItems } from '@/api/api'
import usePaginatedQuery from '@/hooks/usePaginatedQuery'
import { useInfiniteQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'

export const Route = createFileRoute('/dev/infinite')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading, error } =
    usePaginatedQuery({ queryKey: ['items'], queryFn: fetchPaginatedItems })

  if (isLoading) return <p>Loading…</p>
  if (error) return <p>Failed to load</p>

  return (
    <div>
      {data.map((item) => (
        <div key={item.id} className="">
          {item.id}
        </div>
      ))}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} className="action-link">
          Load More
        </button>
      )}
    </div>
  )
}
