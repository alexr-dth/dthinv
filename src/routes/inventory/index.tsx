import { useTranslation } from 'react-i18next'
import {
  fetchItems,
  fetchItemsInventory,
  fetchPaginatedItemsInventory,
  fetchSuppliers,
} from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import InventorySearchWithFilters from '@/components/Search/InventorySearchWithFilters'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideListFilter } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import RowTotalInventoryCard from '@/components/Cards/RowTotalInventoryCard'
import EmptyList from '@/components/EmptyList'
import usePaginatedQuery from '@/hooks/usePaginatedQuery'

export const Route = createFileRoute('/inventory/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState(null)

  const {
    data = {},
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    dataUpdatedAt,
  } = usePaginatedQuery({
    queryKey: ['items/inventory', 'paginated'],
    queryFn: fetchPaginatedItemsInventory,
  })

  const itemsInventory = data?.items ?? []
  const totalCount = data?.totalCount ?? 0

  const closeModal = () => setActiveModal(null)

  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {/* {activeModal.name == 'editItem' && (
              <EditItemModal
                data={activeModal.data}
                cancelCallback={closeModal}
                saveCallback={editItem}
              />
            )} */}
          </div>
        </div>
      )}

      <div className="page-container">
        <div className="flex justify-between">
          <div className="divide-x ">
            <Link to="/" className="action-link !ps-0">
              {t('Home')}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="action-link px-1"
            >
              {t('Back')}
            </button>
          </div>
          {/* <button className="action-link">
            Save
          </button> */}
        </div>
        <h2 className="page-title">Onhand Items</h2>

        <div id="title-buttons">
          <Link className="action-link" to="/request">
            {t('Request item')}
          </Link>
        </div>

        <InventorySearchWithFilters />

        <EmptyList
          iterable={itemsInventory}
          nonEmpty={
            <div className="space-y-2">
              {itemsInventory?.map((item) => (
                <RowTotalInventoryCard key={item.id} data={item} />
              ))}
            </div>
          }
        />

        <div className="mt-5 text-center mb-5">
          <div className="text-xs mb-4 font-light text-gray-400">
            Showing {itemsInventory.length} of {totalCount} items
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
    </>
  )
}
