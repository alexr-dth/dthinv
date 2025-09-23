import { useInfiniteQuery } from '@tanstack/react-query'

export default function usePaginatedQuery({ queryKey, queryFn }) {
  return useInfiniteQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    select: (fetched) => ({
      data: fetched.pages.flatMap((p) => p.data),
      totalCount: fetched?.pages[0].totalCount || 0,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      try {
        const totalCount = lastPage?.totalCount

        if (typeof totalCount !== 'number') {
          console.warn(
            'Missing or invalid totalCount in API response',
            lastPage,
          )
          return undefined
        }

        const totalFetched = allPages.reduce((acc, page) => {
          const items = Array.isArray(page.data) ? page.data.length : 0
          return acc + items
        }, 0)

        if (totalFetched < totalCount) {
          return allPages.length + 1
        }

        return undefined
      } catch (err) {
        console.error('Error in getNextPageParam:', err)
        return undefined // fail gracefully
      }
    },
  })
}
