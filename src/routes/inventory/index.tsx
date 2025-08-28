import { fetchItems } from '@/api/api'
import PageLoader from '@/components/PageLoader'
import ProductSearchBarWithFilters from '@/components/ProductSearchBarWithFilters'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { LucideListFilter } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/inventory/')({
  component: RouteComponent,
})

function RouteComponent() {
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
  if (error) return <p>Error: {error.message}</p>
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
        <h2 className="text-2xl text-center mb-3 font-bold">Onhand Inventory</h2>

        <ProductSearchBarWithFilters />

        <div className="grid grid-cols-2 gap-3 ">
          {data?.map((item) => (
            <ItemCard
              key={item.id}
              data={item}
              setActiveModal={setActiveModal}
            />
          ))}
        </div>
      </div>
    </>
  )
}

const ItemCard = ({ data, setActiveModal }) => {
  return (
    <div className="rounded border p-2 h-full flex flex-col">
      <img
        src="/warehouse.jpg"
        alt=""
        className="w-full aspect-square object-cover mb-2"
      />

      {/* Vendor / Store */}
      <div className="text-xs text-gray-600 font-semibold mb-1 truncate">
        {data?.vendor || 'undefined'}
      </div>

      {/* Product Name */}
      <div className="text-lg leading-5 line-clamp-2 mb-3 flex-grow-1 flex-shrink-0">
        {data?.name || 'undefined'}
      </div>

      {/* SKU / ID */}
      <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
        {data?.sku || 'SKU-MISSING'}
      </div>

      {/* Secondary ID */}
      <div className="text-xs text-gray-400 truncate">
        {data?.internal_sku || 'DTH-MISSING'}
      </div>

      <div className="text-sm flex items-center justify-between gap-2">
        <button
          className="text-blue-500 underline"
          onClick={() => setActiveModal({ name: 'editItem', data: data })}
        >
          Update
        </button>

        <div className="text-nowrap font-medium truncate">
          <span className="font-semibold">Onhand:</span>{' '}
          <span className="">{data?.stock}</span>
        </div>
      </div>
    </div>
  )
}

const EditItemModal = ({ data, saveCallback, cancelCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={saveCallback} method="post">
        <h3 className="font-semibold  mb-3 text-xl">Edit item</h3>
        <div className="flex flex-col gap-1 ">
          <input type="hidden" name="id" value={data?.id} />

          <input
            type="file"
            name="product_img"
            accept="image/*"
            className=" file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white "
          />

          <textarea
            name="name"
            placeholder="Name"
            defaultValue={data?.name}
            className="form-control"
          />
          <input
            name="vendor"
            type="text"
            placeholder="Vendor"
            defaultValue={data?.vendor}
            className="w-full border rounded p-2"
          />
          <input
            name="sku"
            type="text"
            placeholder="SKU"
            defaultValue={data?.sku}
            className="w-full border rounded p-2"
          />
          <input
            name="internal_sku"
            type="text"
            placeholder="Internal SKU"
            defaultValue={data?.internal_sku}
            className="w-full border rounded p-2"
          />
          <input
            name="price"
            type="text"
            placeholder="Price"
            defaultValue={data?.price}
            className="w-full border rounded p-2"
          />
          <input
            name="stock"
            type="text"
            placeholder="Stock"
            defaultValue={data?.stock}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="border flex-1 py-2 px-4 rounded mt-2 cursor-pointer"
            onClick={cancelCallback}
            type="button"
          >
            Close
          </button>
          <button
            className="border flex-1 py-2 px-4 rounded mt-2 cursor-pointer"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
