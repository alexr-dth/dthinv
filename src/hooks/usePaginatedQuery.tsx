import { useInfiniteQuery } from '@tanstack/react-query'
import type { Callback } from 'i18next'

export default function usePaginatedQuery({
  queryKey,
  queryFn,
  enabled = true,
  select = null,
}) {
  return useInfiniteQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    enabled: enabled,

    select: (fetched) => {
      const flatData = {
        items: fetched.pages.flatMap((p) =>
          Array.isArray(p?.data) ? p.data : [],
        ),
        totalCount: fetched?.pages[0].totalCount || 0,
      }

      if (select != null) select(flatData)
      return flatData
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      try {
        const totalCount = lastPage?.totalCount || 0

        const totalFetched = allPages.reduce((acc, page) => {
          const items = Array.isArray(page.data) ? page.data.length : 0
          return acc + items
        }, 0)

        if (totalFetched < totalCount) {
          return allPages.length + 1
        }

        return undefined // no more pages
      } catch (err) {
        console.error('Error in getNextPageParam:', err)
        return undefined // fail gracefully
      }
    },
  })
}
