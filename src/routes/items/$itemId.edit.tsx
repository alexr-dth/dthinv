import {
  editItemMutation,
  fetchItems,
  fetchLocations,
  fetchSuppliers,
  showItem,
} from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useRef } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/items/$itemId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const itemImageDisplay = useRef(null)
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { itemId } = useParams({ from: '/items/$itemId/edit' })

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

  const handleChangeImage = async () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = async (e) => {
      const imageFile = e.target?.files[0]

      const myPromise = new Promise((resolve) => setTimeout(resolve, 1000))
      toast.promise(myPromise, {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Errored!',
      })
      await myPromise

      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        // axios or fetch
        if (itemImageDisplay && itemImageDisplay.current) {
          const imageRef = itemImageDisplay.current

          const reader = new FileReader()
          reader.onload = (e) => {
            imageRef.src = e.target.result
          }

          reader.readAsDataURL(imageFile)
        }
      }
    }
    fileInput.click()
  }

  const { mutateAsync: patchItem } = useMutation({
    mutationFn: editItemMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
  const handleEditItem = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true

    try {
      await patchItem({
        id: itemData.id,
        item_desc: form.elements['item_desc']?.value,
        item_desc_mandarin: form.elements['item_desc_mandarin']?.value,
        template: form.elements['template']?.value,
        sku_number: form.elements['sku_number']?.value,
        internet_sku_number: form.elements['internet_sku_number']?.value,
        internal_sku: form.elements['internal_sku']?.value,
        dth_sku: form.elements['dth_sku']?.value,
        temp_internal_sku: form.elements['temp_internal_sku']?.value,
        material_id: form.elements['material_id']?.value,
        upc: form.elements['upc']?.value?.split(' '),
        supplier_id: form.elements['supplier_id']?.value,

        item_price: form.elements['item_price']?.value,
        default_order_qty: form.elements['default_order_qty']?.value,
        pack_size: form.elements['pack_size']?.value,
        label_size: form.elements['label_size']?.value,
        inventory_location_id: form.elements['inventory_location_id']?.value,
        is_reorder: form.elements['is_reorder']?.value,
      })
      // closeModal()
      toast.success('Update success')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

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
          ref={itemImageDisplay}
          src={itemData.item_image}
          className="border w-3/4 mx-auto rounded object-contain aspect-square"
        />
        <button
          className="action-link mx-auto block"
          onClick={handleChangeImage}
        >
          Change image
        </button>
        <h2 className="text-center mt-2">
          {itemData.short_name ||
            itemData.item_desc ||
            itemData.sku ||
            itemData.id}
        </h2>
      </div>

      <form className="space-y-3 mt-5" onSubmit={handleEditItem}>
        <fieldset>
          <details className="open:[&>summary]:text-blue-500">
            <summary className="text-lg font-semibold text-gray-500">
              Descriptions
            </summary>

            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">Item Description</div>
                <textarea
                  name="item_desc"
                  className="form-control-bare w-full"
                  defaultValue={itemData.item_desc}
                />
              </div>
              <div>
                <div className="font-bold text-xs">
                  Item Description Mandarin
                </div>
                <textarea
                  name="item_desc_mandarin"
                  className="form-control-bare w-full"
                  defaultValue={itemData.item_desc_mandarin}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Template</div>
                <textarea
                  name="template"
                  className="form-control-bare w-full"
                  defaultValue={itemData.template}
                />
              </div>
            </div>
          </details>
        </fieldset>

        <fieldset>
          <details className="open:[&>summary]:text-blue-500">
            <summary className="text-lg font-semibold text-gray-500">
              Identifiers
            </summary>

            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">SKU</div>
                <textarea
                  name="sku_number"
                  className="form-control-bare w-full"
                  defaultValue={itemData.sku_number}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Internet SKU</div>
                <textarea
                  name="internet_sku_number"
                  className="form-control-bare w-full"
                  defaultValue={itemData.internet_sku_number}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Internal SKU</div>
                <textarea
                  name="internal_sku"
                  className="form-control-bare w-full"
                  defaultValue={itemData.internal_sku}
                />
              </div>
              <div>
                <div className="font-bold text-xs">DTH SKU</div>
                <textarea
                  name="dth_sku"
                  className="form-control-bare w-full"
                  defaultValue={itemData.dth_sku}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Temp Internal SKU</div>
                <textarea
                  name="temp_internal_sku"
                  className="form-control-bare w-full"
                  defaultValue={itemData.temp_internal_sku}
                />
              </div>
              <div>
                <div className="font-bold text-xs">Material ID</div>
                <textarea
                  name="material_id"
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
                  name="upc"
                  className="form-control-bare w-full"
                  defaultValue={(itemData.upc || []).join(', ')}
                />
              </div>
            </div>
          </details>
        </fieldset>

        <fieldset>
          <details className="open:[&>summary]:text-blue-500">
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
                  aria-readonly
                >
                  {suppliersData.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex *:flex-1 gap-3">
                <div>
                  <div className="font-bold text-xs">Item Price</div>
                  <input
                    name="item_price"
                    type="number"
                    step="0.01"
                    className="form-control-bare w-full"
                    defaultValue={itemData.item_price}
                  />
                </div>
                <div>
                  <div className="font-bold text-xs">Default Order Qty</div>
                  <input
                    name="default_order_qty"
                    type="number"
                    className="form-control-bare w-full"
                    defaultValue={itemData.default_order_qty}
                  />
                </div>
                <div>
                  <div className="font-bold text-xs">Pack Size</div>
                  <input
                    name="pack_size"
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
          <details className="open:[&>summary]:text-blue-500">
            <summary className="text-lg font-semibold text-gray-500">
              Inventory & Logistics
            </summary>
            <div className="space-y-1 mt-2">
              <div>
                <div className="font-bold text-xs">Label Size</div>
                <input
                  name="label_size"
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
