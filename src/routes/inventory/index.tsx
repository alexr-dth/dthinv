import { useTranslation } from 'react-i18next'
import { fetchItems, fetchSuppliers } from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import ItemSearchBarWithFilters from '@/components/ItemSearchBarWithFilters'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideListFilter } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import ItemCard from '@/components/Cards/ItemCard'

export const Route = createFileRoute('/inventory/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  })

  const closeModal = () => setActiveModal(null)

  const editItem = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true

    try {
      const newData = {
        id: form.elements['id']?.value,
        image: form.elements['image']?.value,
        vendor: form.elements['vendor']?.value,
        name: form.elements['name']?.value,
        sku: form.elements['sku']?.value,
        internal_sku: form.elements['internal_sku']?.value,
        price: form.elements['price']?.value,
        stock: form.elements['stock']?.value,
      }

      // await patchItem(newData)
    } finally {
      closeModal()
      toast.success('Update success')
      btn.disabled = false
    }
  }
  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg">
            {activeModal.name == 'editItem' && (
              <EditItemModal
                data={activeModal.data}
                cancelCallback={closeModal}
                saveCallback={editItem}
              />
            )}
          </div>
        </div>
      )}

      <div className="sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3">
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

        <div
          id="title-buttons"
          className="divide-x text-nowrap overflow-auto pb-1"
        >
          <Link className="action-link" to="/request">
            {t('Request item')}
          </Link>
        </div>

        <ItemSearchBarWithFilters />

        <div className="grid grid-cols-2 gap-3 ">
          {data?.map((item) => (
            <ItemCard
              key={item.id}
              data={item}
              actions={({ data }) => (
                <div className="flex justify-end">
                  <button
                    className="action-link text-end text-sm"
                    onClick={() =>
                      setActiveModal({ name: 'editItem', data: data })
                    }
                  >
                    {t('Update')}
                  </button>
                </div>
              )}
            />
          ))}
        </div>
      </div>
    </>
  )
}

const EditItemModal = ({ data, saveCallback, cancelCallback }) => {
  // USED IN INVENTORY AND ITEMS/PRODUCTS INDEX
  const { t } = useTranslation()
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={saveCallback} method="post">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="font-semibold text-xl">Edit item details</h3>
          <button
            className="action-link not-disabled:!text-red-500 !px-0"
            disabled
          >
            Delete
          </button>
        </div>

        {/* MODAL'S CONTENT */}
        <div className="flex flex-col space-y-1 max-h-[75lvh] overflow-auto p-2 border-y border-gray-400">
          <input type="hidden" name="id" value={data?.id} />

          <label className="mb-0 text-xs italic">Display image</label>
          <input
            type="file"
            name="product_img"
            accept="image/*"
            className="form-control"
          />

          <label className="mb-0 text-xs italic">Item name</label>
          <textarea
            name="name"
            placeholder="Quantum Wrench 1200/12ft"
            defaultValue={data?.short_name}
            className="form-control"
          />

          <label className="mb-0 text-xs italic">Supplier</label>
          <select
            name="supplier"
            defaultValue={data.supplier || 'Home Depot'}
            className="form-control"
          >
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>

          <label className="mb-0 text-xs italic">Supplier's SKU</label>
          <input
            name="external_sku"
            type="text"
            placeholder="SKU-9M1LT8"
            defaultValue={data?.sku_number}
            className="w-full border rounded p-2"
          />

          <label className="mb-0 text-xs italic">Internal SKU</label>
          <input
            name="internal_sku"
            type="text"
            placeholder="DTH000000001"
            defaultValue={data?.internet_sku_number}
            className="w-full border rounded p-2"
          />

          <label className="mb-0 text-xs italic">Price</label>
          <input
            name="price"
            type="number"
            placeholder="$100.00"
            defaultValue={data?.item_price}
            className="w-full border rounded p-2"
          />

          <label className="mb-0 text-xs italic">Onhand</label>
          <input
            name="stocks"
            type="number"
            placeholder="100"
            defaultValue={data?.inventory}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="border flex-1 py-2 px-4 rounded mt-2 cursor-pointer"
            onClick={cancelCallback}
            type="button"
          >
            {t('Close')}
          </button>
          <button
            className="border flex-1 py-2 px-4 rounded mt-2 cursor-pointer"
            type="submit"
          >
            {t('Save')}
          </button>
        </div>
      </form>
    </div>
  )
}
