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
  removeItemMutation,
} from '@/api/api'
import BasicLoader from '@/components/BasicLoader'
import ProductSearchBarWithFilters from '@/components/ProductSearchBarWithFilters'
import PageLoader from '@/components/PageLoader'

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
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  })

  useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
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

  const { mutateAsync: deleteItem } = useMutation({
    mutationFn: removeItemMutation,
    onSuccess: () => queryClient.invalidateQueries(['items']),
  })

  const closeModal = () => setActiveModal(null)

  const handleAddItem = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true

    try {
      const newItem = {
        supplier: {
          id: form.elements['supplier_id']?.value,
          name: form.elements['supplier_name']?.value,
        },
        name: form.elements['name']?.value,
        external_sku: form.elements['external_sku']?.value,
        internal_sku: form.elements['internal_sku']?.value,
        price: parseFloat(form.elements['price']?.value),
        stocks: parseInt(form.elements['stocks']?.value),
        image: form.elements['image']?.value,
      }

      await createItem(newItem)
    } finally {
      toast.success('Added item')
      closeModal()
      btn.disabled = false
    }
  }

  const handleEditItem = async (e) => {
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

  if (isLoading) return <PageLoader />
  if (error) return <p>Error: {error.message}</p>
  return (
    <>
      {/* START MODAL */}
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg">
            {activeModal.name == 'addItem' && (
              <AddItemModal
                cancelCallback={closeModal}
                saveCallback={handleAddItem}
              />
            )}

            {activeModal.name == 'editItem' && (
              <EditItemModal
                data={activeModal.data}
                cancelCallback={closeModal}
                saveCallback={handleEditItem}
              />
            )}
          </div>
        </div>
      )}
      {/* END MODAL */}

      <div className="sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3">
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

          {/* <button className="action-link">
            Save
          </button> */}
        </div>

        <h2 className="page-title">Item Catalogue</h2>

        {/* BELOW-TITLE OPTIONS */}
        <div
          id="title-buttons"
          className="divide-x mt-6 mb-2 text-nowrap overflow-auto pb-2"
        >
          <button
            className="action-link"
            onClick={() => setActiveModal({ name: 'addItem' })}
          >
            Add item
          </button>
          <Link className="action-link" to="/suppliers/add">
            Add supplier
          </Link>
          <button className="action-link" disabled>
            Bulk Update (Items)
          </button>
          <button className="action-link" disabled>
            Bulk Update (UPC)
          </button>
        </div>

        <ProductSearchBarWithFilters />

        <div className="grid grid-cols-2 gap-3 ">
          {items?.map((item) => (
            <ProductGridCard
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

const ProductGridCard = ({ data, setActiveModal }) => {
  return (
    <div className="rounded border p-2 h-full">
      {/* CONTENT */}
      <div className="flex flex-col">
        <img
          src={data?.image || 'missing.png'}
          alt=""
          className="w-full aspect-square object-cover mb-2"
        />

        <div className="text-xs text-gray-600 font-semibold mb-1 truncate">
          {data.supplier?.name || 'n/a'}
        </div>

        <div className="text-lg leading-5 line-clamp-2 flex-grow-1 flex-shrink-0">
          {data.name || 'n/a'}
        </div>

        <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
          {data.external_sku || 'n/a'}
        </div>

        <div className="text-xs text-gray-400 truncate">
          {data?.internal_sku || 'n/a'}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2/5 me-auto text-nowrap font-medium text-sm truncate">
            <span className="font-semibold">Stk:</span>{' '}
            <span className="">{data.stocks || 0}</span>
          </div>

          <div className="w-3/5 text-2xl font-bold text-gray-800 truncate text-end">
            ${parseFloat(data.price).toFixed(2) || 'n/a'}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end">
        <button
          className="action-link text-end text-sm"
          onClick={() => setActiveModal({ name: 'editItem', data: data })}
        >
          Update
        </button>
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
    isLoading: suppliersLoading,
    error,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })

  const { mutateAsync: createSupplier } = useMutation({
    mutationFn: addSupplierMutation,
    onSuccess: () => queryClient.invalidateQueries(['suppliers']),
  })

  const handleAddSupplier = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true

    try {
      const supplierName = form.elements['name']?.value
      const supplierQr = form.elements['barcode_qr']?.value
      const newSupplier = { name: supplierName, barcode_qr: supplierQr }

      await createSupplier(newSupplier)
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
              <form onSubmit={handleAddSupplier} method="post">
                <div className="space-y-1">
                  <input
                    name="name"
                    type="text"
                    placeholder="Supplier's name"
                    className="w-full border rounded p-2"
                    required
                  />
                  <input
                    name="barcode_qr"
                    type="text"
                    placeholder="QR Code"
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

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

            <div className="space-y-2 mb-6 max-h-72 overflow-auto py-5 px-10 border rounded">
              <BasicLoader waitFor={suppliersLoading} />
              {suppliers.map((sup) => (
                <button
                  key={sup.id}
                  className="btn !rounded-none w-full"
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
          <>
            <h3 className="font-semibold mb-3 text-xl">Add item</h3>
            <form onSubmit={saveCallback} method="post">
              <div className="flex flex-col space-y-1 ">
                <span className="text-xs m-0">Selected supplier</span>
                <input
                  name="supplier_name"
                  type="text"
                  placeholder="Supplier"
                  defaultValue={selectedSupplier.name}
                  className="form-control mb-5"
                  readOnly
                />

                <input
                  name="supplier_id"
                  type="hidden"
                  placeholder="Supplier"
                  defaultValue={selectedSupplier.id}
                  className="form-control mb-5"
                  readOnly
                />

                <select name="image" className="form-control">
                  <option value="/warehouse.jpg">Test - Warehouse</option>
                  <option value="/pliers.jpg">Test - Pliers</option>
                  <option value="/wrench.jpg">Test - Wrench</option>
                  <option value="/drill.jpg">Test - Drill</option>
                </select>

                {/*                 
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="form-control "
                /> */}

                <textarea
                  name="name"
                  placeholder="Name"
                  className="form-control"
                  required
                />

                <input
                  name="external_sku"
                  type="text"
                  placeholder="External SKU"
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
                  type="number"
                  placeholder="Price"
                  defaultValue={0}
                  className="form-control"
                />
                <input
                  name="stocks"
                  type="number"
                  placeholder="Stocks"
                  defaultValue={0}
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
          </>
        )}
      </div>
    </>
  )
}

const EditItemModal = ({ data, saveCallback, cancelCallback }) => {
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={saveCallback} method="post">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="font-semibold text-xl">Edit item</h3>
          <button className="action-button !text-red-500 ">Delete</button>
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
            defaultValue={data?.name}
            className="form-control"
          />

          <label className="mb-0 text-xs italic">Supplier</label>
          <select
            name="supplier"
            defaultValue={data.supplier}
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
            defaultValue={data?.external_sku}
            className="w-full border rounded p-2"
          />

          <label className="mb-0 text-xs italic">Internal SKU</label>
          <input
            name="internal_sku"
            type="text"
            placeholder="DTH000000001"
            defaultValue={data?.internal_sku}
            className="w-full border rounded p-2"
          />

          <label className="mb-0 text-xs italic">Price</label>
          <input
            name="price"
            type="number"
            placeholder="$100.00"
            defaultValue={data?.price}
            className="w-full border rounded p-2"
          />

          <label className="mb-0 text-xs italic">Available Stocks</label>
          <input
            name="stocks"
            type="number"
            placeholder="100"
            defaultValue={data?.stocks}
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
