import {
  editItemMutation,
  fetchItems,
  fetchLocations,
  fetchLocationsFormatted,
  fetchSuppliers,
  showItem,
  showItemInventory,
} from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import createInventoryPerLocation from '@/helpers/createInventoryPerLocation'
import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/items/$itemId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const itemImageDisplay = useRef(null)
  const { itemId } = useParams({ from: '/items/$itemId/' })
  const { t } = useTranslation()

  const [
    {
      data: itemWithInventoryData = {},
      isLoading: isItemLoading,
      error: itemError,
    },
    {
      data: suppliersData = [],
      isLoading: isSuppliersLoading,
      error: suppliersError,
    },
    {
      data: locationsData = [],
      isLoading: isLocationsLoading,
      error: locationsError,
    },
  ] = useQueries({
    queries: [
      {
        queryKey: ['items/inventory', itemId],
        queryFn: () => showItemInventory(itemId, { outer: true }),
      },
      {
        queryKey: ['suppliers'],
        queryFn: fetchSuppliers,
      },
      {
        queryKey: ['locations'],
        queryFn: fetchLocations,
      },
    ],
  })

  const inventoryPerLocation = useMemo(
    () => createInventoryPerLocation(itemWithInventoryData?.inventory),
    [itemWithInventoryData],
  )

  const anyLoading = isItemLoading || isSuppliersLoading || isLocationsLoading
  const firstError = itemError || suppliersError || locationsError

  if (anyLoading) return <PageLoader />
  if (firstError) return <ErrorScreen error={firstError} />

  return (
    <div className="page-container">
      <div className="flex justify-between">
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

        <Link
          to="/items/$itemId/edit"
          params={{ itemId: itemId }}
          className="action-link !ps-0"
        >
          Edit
        </Link>
      </div>

      <h2 className="page-title">Item Details</h2>

      <div>
        <img
          ref={itemImageDisplay}
          src={itemWithInventoryData?.item_image}
          className="border w-3/4 mx-auto rounded object-contain aspect-square"
        />
        <h2 className="text-center mt-2">
          {itemWithInventoryData?.short_name ||
            itemWithInventoryData?.item_desc ||
            itemWithInventoryData?.sku ||
            itemWithInventoryData?.id}
        </h2>
      </div>

      <section className="space-y-3 mt-5">
        <div>
          <details className="open:[&>summary]:text-blue-500">
            <summary className="text-lg font-semibold text-gray-500">
              Descriptions
            </summary>

            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">Item Description</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.item_desc || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-xs">
                  Item Description Mandarin
                </div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.item_desc_mandarin || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-xs">Template</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.template || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
            </div>
          </details>
        </div>

        <div>
          <details className="open:[&>summary]:text-blue-500">
            <summary className="text-lg font-semibold text-gray-500">
              Identifiers
            </summary>

            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">SKU</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.sku_number || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-xs">Internet SKU</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.internet_sku_number || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-xs">Internal SKU</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.internal_sku || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-xs">DTH SKU</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.dth_sku || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-xs">Temp Internal SKU</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.temp_internal_sku || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-xs">Material ID</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.material_id || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-xs">
                  UPC{' '}
                  <span className="font-light text-xs italic">
                    *Separate multiple entries using comma.
                  </span>
                </div>
                <div className="ms-2 empty:py-2">
                  {(itemWithInventoryData?.upc || []).join(', ') || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
            </div>
          </details>
        </div>

        <div>
          <details className="open:[&>summary]:text-blue-500">
            <summary className="text-lg font-semibold text-gray-500">
              Supplier & Pricing
            </summary>
            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">Supplier</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.supplier?.name || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>

              <div className="flex *:flex-1 gap-3">
                <div>
                  <div className="font-bold text-xs">Item Price</div>
                  <div className="ms-2 empty:py-2">
                    {itemWithInventoryData?.item_price || (
                      <span className="text-gray-400">n/a</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-xs">Default Order Qty</div>
                  <div className="ms-2 empty:py-2">
                    {itemWithInventoryData?.default_order_qty || (
                      <span className="text-gray-400">n/a</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-xs">Pack Size</div>
                  <div className="ms-2 empty:py-2">
                    {itemWithInventoryData?.pack_size || (
                      <span className="text-gray-400">n/a</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>

        <div>
          <details className="open:[&>summary]:text-blue-500">
            <summary className="text-lg font-semibold text-gray-500">
              Inventory & Logistics
            </summary>
            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">Label Size</div>
                <div className="ms-2 empty:py-2">
                  {itemWithInventoryData?.label_size || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>
              <div className="flex *:flex-1 gap-3">
                <div>
                  <div className="font-bold text-xs">
                    Default Inventory Location
                  </div>
                  <div className="ms-2 empty:py-2">
                    {itemWithInventoryData?.default_location?.name || (
                      <span className="text-gray-400">n/a</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-xs">Automatic Reorder</div>
                  <div className="ms-2 empty:py-2">
                    {itemWithInventoryData?.is_reorder?.toString() ?? (
                      <span className="text-gray-400">n/a</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex *:flex-1 gap-3">
                <div>
                  <div className="font-bold text-xs">Total Onhand</div>
                  <div className="ms-2 empty:py-2">
                    {itemWithInventoryData?.inventory.length || (
                      <span className="text-gray-400">n/a</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-xs">Reorder Point</div>
                  {itemWithInventoryData?.reorder_point || (
                    <span className="text-gray-400">n/a</span>
                  )}
                </div>
              </div>

              <div>
                <div className="font-bold text-xs">Inventory Per Location</div>
                <ul className="ms-2 empty:py-2">
                  {!inventoryPerLocation?.length && (
                    <span className="text-gray-400">n/a</span>
                  )}
                  {inventoryPerLocation.map((location) => (
                    <li
                      key={location.id}
                      className="flex [&>*]:flex-1 items-center gap-3 before:content-['•']"
                    >
                      <span className="text-sm">{location.name}:</span>
                      <span>
                        <span className="font-semibold">
                          {location?.inventory?.length}
                        </span>{' '}
                        <span className="italic text-gray-400 text-xs">
                          unit/s
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </div>
      </section>
    </div>
  )
}
