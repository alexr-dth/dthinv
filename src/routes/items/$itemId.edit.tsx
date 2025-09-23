import { fetchItems, fetchLocations, fetchSuppliers, showItem } from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/items/$itemId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { itemId } = useParams({ from: '/items/$itemId/edit' })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['items'],
      queryFn: fetchItems,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    })

  const [
    { data: itemData = {}, isLoading: isItemLoading, error: itemError },
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
        queryKey: ['items', itemId],
        queryFn: () => showItem(itemId),
        enabled: !!itemId,
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
      </div>

      <h2 className="page-title">Item Details</h2>

      <div>
        <img
          src={itemData.item_image}
          className="border w-3/4 mx-auto rounded object-contain aspect-square"
        />
        <h2 className="text-center text-xl mt-2">{itemData.short_name}</h2>
      </div>

      <form className="space-y-3 mt-5">
        <fieldset>
          <details>
            <summary className="text-lg font-semibold text-gray-500">
              Descriptions
            </summary>

            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">Item Description</div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.item_desc}
                />
              </div>
              <div>
                <div className="font-bold text-xs">
                  Item Description Mandarin
                </div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.item_desc_mandarin}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Template</div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.template}
                />
              </div>
            </div>
          </details>
        </fieldset>

        <fieldset>
          <details>
            <summary className="text-lg font-semibold text-gray-500">
              Identifiers
            </summary>

            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">SKU</div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.sku_number}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Internet SKU</div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.internet_sku_number}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Internal SKU</div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.internal_sku}
                />
              </div>
              <div>
                <div className="font-bold text-xs">DTH SKU</div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.dth_sku}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Temp Internal SKU</div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.temp_internal_sku}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Material ID</div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={itemData.material_id}
                />
              </div>
              <div>
                <div className="font-bold text-xs">
                  UPC{' '}
                  <span className="font-light text-xs italic">
                    *Separate multiple entries using comma.
                  </span>
                </div>
                <textarea
                  className="form-control-bare w-full"
                  defaultValue={(itemData.upc || []).join(', ')}
                />
              </div>
            </div>
          </details>
        </fieldset>

        <fieldset>
          <details>
            <summary className="text-lg font-semibold text-gray-500">
              Supplier & Pricing
            </summary>
            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">Supplier</div>
                <select
                  name="supplier_id"
                  className="form-control-bare min-w-1/2"
                  defaultValue={itemData.supplier_id}
                >
                  {suppliersData.map((supplier) => (
                    <option value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex *:flex-1 gap-3">
                <div>
                  <div className="font-bold text-xs">Item Price</div>
                  <input
                    type="number"
                    className="form-control-bare w-full"
                    defaultValue={itemData.item_price}
                  />
                </div>
                <div>
                  <div className="font-bold text-xs">Default Order Qty</div>
                  <input
                    type="number"
                    className="form-control-bare w-full"
                    defaultValue={itemData.default_order_qty}
                  />
                </div>
                <div>
                  <div className="font-bold text-xs">Pack Size</div>
                  <input
                    type="number"
                    className="form-control-bare w-full"
                    defaultValue={itemData.pack_size}
                  />
                </div>
              </div>
            </div>
          </details>
        </fieldset>

        <fieldset>
          <details>
            <summary className="text-lg font-semibold text-gray-500">
              Inventory & Logistics
            </summary>
            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">Label Size</div>
                <input
                  type="text"
                  className="form-control-bare w-full"
                  defaultValue={itemData.label_size}
                />
              </div>
              <div className="flex *:flex-1 gap-3">
                <div>
                  <div className="font-bold text-xs">
                    Default Inventory Location
                  </div>
                  <select
                    name="inventory_location_id"
                    className="form-control-bare w-full"
                    defaultValue={itemData.inventory_location_id}
                  >
                    {locationsData.map((location) => (
                      <option value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="font-bold text-xs">Onhand</div>
                  <input
                    type="text"
                    className="form-control-bare w-full"
                    defaultValue={itemData.inventory}
                    readOnly
                  />
                </div>
              </div>

              <div className="flex *:flex-1 gap-3">
                <div>
                  <div className="font-bold text-xs">Automatic Reorder</div>
                  <select
                    name="is_reorder"
                    className="form-control-bare w-full"
                    defaultValue={itemData.is_reorder.toString()}
                  >
                    <option key={1} value="true">
                      Yes
                    </option>
                    <option key={2} value="false">
                      No
                    </option>
                  </select>
                </div>
                <div>
                  <div className="font-bold text-xs">Reorder Point</div>
                  <input
                    type="text"
                    className="form-control-bare w-full"
                    readOnly
                    defaultValue={itemData.reorder_point}
                  />
                </div>
              </div>
            </div>
          </details>
        </fieldset>

        <button className="btn w-full mt-5" type="submit">
          Update
        </button>
      </form>
    </div>
  )
}
