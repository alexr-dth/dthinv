import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideListFilter } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  addItemMutation,
  addSupplierMutation,
  editItemMutation,
  fetchItems,
  fetchSuppliers,
} from '@/api/api'

// MAIN APP
export const Route = createFileRoute('/items/')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()

  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  // React Query - for fetching data via api
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  })

  // React Query - for mutating/updating data via api
  const { mutateAsync: createItem } = useMutation({
    mutationFn: addItemMutation,
    onSuccess: () => queryClient.invalidateQueries(['items']),
  })

  const { mutateAsync: patchItem } = useMutation({
    mutationFn: editItemMutation,
    onSuccess: () => queryClient.invalidateQueries(['items']),
  })

  const closeModal = () => setActiveModal(null)

  const addItem = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true

    try {
      const newItem = {
        id: Date.now().toString(),
        image: form.elements['image']?.value || '',
        vendor: form.elements['vendor']?.value || '',
        name: form.elements['name']?.value || '',
        sku: form.elements['sku']?.value || '',
        internal_sku: form.elements['internal_sku']?.value || '',
        price: form.elements['price']?.value || '',
        stock: form.elements['stock']?.value || '',
      }

      await createItem(newItem)
    } finally {
      toast.success('Added item')
      closeModal()
      btn.disabled = false
    }
  }

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

      await patchItem(newData)
    } finally {
      closeModal()
      toast.success('Update success')
      btn.disabled = false
    }
  }

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg">
            {activeModal.name == 'addItem' && (
              <AddItemModal
                cancelCallback={closeModal}
                saveCallback={addItem}
              />
            )}

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
        <h2 className="text-2xl text-center mb-3 font-bold">Item Catalogue</h2>

        <div className="divide-x mt-6 mb-2 text-nowrap overflow-auto pb-2">
          <button
            className="action-link"
            onClick={() => setActiveModal({ name: 'addItem' })}
          >
            Add item
          </button>
          <Link className="action-link" to="/suppliers/add">
            Add supplier
          </Link>
          <button className="action-link">Bulk Update Item</button>
          <button className="action-link">Bulk Update UPC</button>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <input
            type="text"
            className="form-control flex-1"
            placeholder="Search"
          />
          <div className="">
            <LucideListFilter
              size={42}
              className="bg-white p-0.5 rounded border cursor-pointer text-black shadow"
              onClick={(e) => {
                e.stopPropagation()
                setOptionExpanded(!optionExpanded)
              }}
            />
          </div>
        </div>

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
        {data?.vendor}
      </div>

      {/* Product Name */}
      <div className="text-lg leading-5 line-clamp-2 mb-3 flex-grow-1 flex-shrink-0">
        {data?.name}
      </div>

      {/* SKU / ID */}
      <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
        {data?.sku}
      </div>

      {/* Secondary ID */}
      <div className="text-xs text-gray-400 truncate">{data?.internal_sku}</div>

      {/* Price — bigger + bold */}
      <div className="text-xl font-bold text-gray-800 text-end truncate ">
        ${data?.price}
      </div>

      <div className="text-sm flex items-center justify-between gap-2">
        <button
          className="text-blue-500 underline"
          onClick={() => setActiveModal({ name: 'editItem', data: data })}
        >
          Update
        </button>

        <div className="text-nowrap font-medium truncate">
          <span className="font-semibold">Stock:</span>{' '}
          <span className="">{data?.stock}</span>
        </div>
      </div>
    </div>
  )
}

const AddItemModal = ({ saveCallback, cancelCallback }) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [newSupplierModal, openSupplierModal] = useState(false)
  const queryClient = useQueryClient()

  // React Query - for fetching data via api
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })

  const { mutateAsync: createSupplier } = useMutation({
    mutationFn: addSupplierMutation,
    onSuccess: () => queryClient.invalidateQueries(['suppliers']),
  })

  const addSupplier = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true

    try {
      const newItem = {
        id: Date.now().toString(),
        name: form.elements['name']?.value || '',
      }

      await createSupplier(newItem)
    } finally {
      toast.success('Added supplier')
      openSupplierModal(false)
      btn.disabled = false
    }
  }

  return (
    <>
      {newSupplierModal && (
        <div className="fixed w-full h-full  bg-black/60 top-0 left-0 place-content-center grid z-200">
          <div className="w-dvw max-w-lg">
            <div className="bg-white rounded p-3 mx-3">
              <h3 className="font-semibold  mb-3 text-xl">
                Enter supplier name:
              </h3>
              <form onSubmit={addSupplier} method="post">
                <input
                  name="name"
                  type="text"
                  placeholder="Name"
                  className="w-full border rounded p-2"
                />
                <div className="flex gap-2 mt-6">
                  <button
                    className="btn flex-1 "
                    type="button"
                    onClick={() => openSupplierModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn flex-1" type="submit">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded p-3 mx-3">
        {!selectedSupplier ? (
          <>
            <h3 className="font-semibold  mb-3 text-xl">Choose a supplier:</h3>

            <div className="space-y-2 mb-6 max-h-72 overflow-auto p-2 border rounded">
              {suppliers.map((sup) => (
                <button
                  key={sup.id}
                  className="btn w-full"
                  onClick={() => setSelectedSupplier(sup)}
                >
                  {sup.name || 'undefined'}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                className="btn flex-1"
                onClick={cancelCallback}
                type="button"
              >
                Close
              </button>

              <button
                className="btn flex-1 btn-blue"
                type="button"
                onClick={() => openSupplierModal(true)}
              >
                New supplier
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={saveCallback} method="post">
            <h3 className="font-semibold  mb-3 text-xl">Add item</h3>
            <div className="flex flex-col space-y-1 ">
              <span className="text-xs m-0">*Selected supplier</span>
              <input
                name="vendor"
                type="text"
                placeholder="Vendor"
                defaultValue={selectedSupplier.name}
                className="form-control mb-5"
                readOnly
              />

              <input
                type="file"
                name="product_img"
                accept="image/*"
                className=" file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white "
              />

              <textarea
                name="name"
                placeholder="Name"
                className="form-control"
              />

              <input
                name="sku"
                type="text"
                placeholder="SKU"
                className="form-control"
              />
              <input
                name="internal_sku"
                type="text"
                placeholder="Internal SKU"
                className="form-control"
              />
              <input
                name="price"
                type="text"
                placeholder="Price"
                className="form-control"
              />
              <input
                name="stock"
                type="text"
                placeholder="Stock"
                className="form-control"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="btn flex-1"
                onClick={() => setSelectedSupplier(null)}
                type="button"
              >
                Back
              </button>
              <button className="btn flex-1" type="submit">
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </>
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
