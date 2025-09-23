import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import {
  addItemMutation,
  addSupplierMutation,
  editItemMutation,
  fetchItems,
  fetchPaginatedItems,
  fetchSuppliers,
  removeItemMutation,
} from '@/api/api'
import BasicLoader from '@/components/BasicLoader'
import ItemSearchBarWithFilters from '@/components/ItemSearchBarWithFilters'
import PageLoader from '@/components/PageLoader'
import ItemCard from '@/components/Cards/ItemCard'
import ErrorScreen from '@/components/ErrorScreen'
import usePaginatedQuery from '@/hooks/usePaginatedQuery'

// MAIN APP
export const Route = createFileRoute('/items/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)
  const [mode, setMode] = useState('items')
  const [filteredData, setFilteredData] = useState([])

  const {
    data = {},
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    dataUpdatedAt,
  } = usePaginatedQuery({ queryKey: ['items'], queryFn: fetchPaginatedItems })
  const { data: itemsData = [], totalCount } = data

  useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })

  useEffect(() => {
    setFilteredData(itemsData)
  }, [dataUpdatedAt])

  useEffect(() => {
    document.body.style.overflow = activeModal?.name ? 'hidden' : 'auto'
  }, [activeModal])

  const closeModal = () => setActiveModal(null)
  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      {/* START MODAL */}
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {activeModal.name == 'addItem' && (
              <AddItemModal closeModal={closeModal} />
            )}

            {activeModal.name == 'editItem' && (
              <EditItemModal closeModal={closeModal} data={activeModal.data} />
            )}
          </div>
        </div>
      )}

      {/* END MODAL */}
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
        </div>

        <h2 className="page-title">{t('Item Catalogue')}</h2>

        {/* BELOW-TITLE OPTIONS */}
        <div
          id="title-buttons"
          className="divide-x text-nowrap overflow-auto pb-1"
        >
          <button
            className="action-link"
            onClick={() => setActiveModal({ name: 'addItem' })}
          >
            {t('Add item')}
          </button>
          <Link className="action-link" to="/suppliers/add">
            {t('Add supplier')}
          </Link>
        </div>

        <ItemSearchBarWithFilters
          originalData={itemsData}
          setFilteredData={setFilteredData}
        />

        {mode === 'items' && (
          <div className="grid grid-cols-2 gap-2">
            {filteredData?.map((item) => (
              <ItemCard
                key={item?.id}
                data={item}
                actions={({ data }) => (
                  <div className="flex justify-end">
                    {/* <button
                      className="action-link text-end text-sm"
                      onClick={() =>
                        setActiveModal({ name: 'editItem', data: data })
                      }
                    >
                      {t('Update')}
                    </button> */}
                    <Link
                      className="action-link text-end text-sm"
                      to="/items/$itemId/edit"
                      params={{ itemId: item?.id }}
                    >
                      Edit
                    </Link>
                  </div>
                )}
              />
            ))}
          </div>
        )}

        <div className="mt-5 text-center mb-5">
          <div className="text-xs mb-4 font-light text-gray-400">
            Showing {filteredData.length} of {totalCount} items
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

const AddItemModal = ({ closeModal }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [selectedSupplier, setSelectedSupplier] = useState(false)
  const [newSupplierModal, openSupplierModal] = useState(false)

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    error,
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })

  const { mutateAsync: createItem } = useMutation({
    mutationFn: addItemMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })

  const handleAddItem = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true
    try {
      await createItem({
        supplier_id: form.elements['supplier_id']?.value,
        short_name: form.elements['name']?.value,
        sku_number: form.elements['external_sku']?.value,
        internet_sku_number: form.elements['internal_sku']?.value,
        item_desc: form.elements['desc']?.value,
        item_price: parseFloat(form.elements['price']?.value),
        item_image: form.elements['image']?.value,
        order_threshold: form.elements['threshold']?.value,
      })
      closeModal()
      toast.success('Added item')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  const { mutateAsync: createSupplier } = useMutation({
    mutationFn: addSupplierMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  })

  const handleAddSupplier = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true

    try {
      await createSupplier({
        name: form.elements['name']?.value,
        barcode_qr: form.elements['barcode_qr']?.value,
      })
      openSupplierModal(false)
      toast.success('Added supplier')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  return (
    <>
      {newSupplierModal && (
        <div className="fixed w-full h-full  bg-black/60 top-0 left-0 place-content-center grid z-200">
          <div className="w-dvw max-w-md">
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
                    {t('Cancel')}
                  </button>
                  <button className="btn flex-1" type="submit">
                    {t('Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded p-3 mx-3">
        {!selectedSupplier ? (
          // choose supplier
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
              <button className="btn flex-1" onClick={closeModal} type="button">
                {t('Close')}
              </button>

              <button
                className="btn flex-1 btn-blue"
                type="button"
                onClick={() => openSupplierModal(true)}
              >
                {t('New supplier')}
              </button>
            </div>
          </>
        ) : (
          // fill out item info
          <>
            <h3 className="font-semibold mb-3 text-xl">{t('Add item')}</h3>
            <form onSubmit={handleAddItem} method="post">
              <div className="flex flex-col space-y-1 ">
                <span className="text-xs m-0">{t('Selected supplier')}</span>
                <div className="mb-5">
                  <input
                    name="supplier_name"
                    type="text"
                    placeholder="Supplier"
                    defaultValue={selectedSupplier.name}
                    className="form-control w-full"
                    readOnly
                  />
                  <input
                    name="supplier_id"
                    type="hidden"
                    placeholder="Supplier"
                    defaultValue={selectedSupplier.id}
                    className="form-control w-full"
                    readOnly
                  />
                </div>

                <select name="image" className="form-control">
                  <option value="/warehouse.jpg">Warehouse (test)</option>
                  <option value="/pliers.jpg">Pliers (test)</option>
                  <option value="/wrench.jpg">Wrench (test)</option>
                  <option value="/drill.jpg">Drill (test)</option>
                </select>

                {/*                 
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="form-control "
                /> */}

                <input
                  name="name"
                  type="text"
                  placeholder="Name"
                  className="form-control"
                  required
                />

                <textarea
                  name="desc"
                  placeholder="Item Description"
                  className="form-control"
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
                  className="form-control"
                />
                <input
                  name="threshold"
                  type="number"
                  placeholder="(e.g. 10, 20, 30...)"
                  className="form-control"
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  className="btn flex-1"
                  onClick={() => setSelectedSupplier(false)}
                  type="button"
                >
                  {t('Back')}
                </button>
                <button className="btn flex-1" type="submit">
                  {t('Save')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  )
}

const EditItemModal = ({ data, closeModal }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  })

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
        id: data.id,
        short_name: form.elements['name']?.value,
        supplier_id: form.elements['supplier_id']?.value,
        sku_number: form.elements['external_sku']?.value,
        internet_sku_number: form.elements['internal_sku']?.value,
        item_desc: form.elements['desc']?.value,
        item_price: parseFloat(form.elements['price']?.value),
        order_threshold: parseFloat(form.elements['threshold']?.value),
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

  const { mutateAsync: deleteItem } = useMutation({
    mutationFn: removeItemMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
  const handleDeleteItem = async (e) => {
    const btn = e.target
    btn.disabled = true
    try {
      await deleteItem({ id: data.id })
      closeModal()
      toast.success('Delete success')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={handleEditItem} method="post">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="font-semibold text-xl">Edit item details</h3>
          <button
            className="action-link not-disabled:!text-red-500 !px-0"
            onClick={handleDeleteItem}
            type="button"
          >
            Delete
          </button>
        </div>

        {/* MODAL'S CONTENT */}
        <div className="space-y-1 max-h-[75lvh] overflow-auto p-2 border-y border-gray-400">
          <input type="hidden" name="id" value={data?.id} />
          <label className="mb-0 text-xs italic">Display image</label>

          <select
            name="image"
            className="form-control w-full"
            defaultValue={data.item_image}
          >
            <option value="/warehouse.jpg">Warehouse (testing)</option>
            <option value="/pliers.jpg">Pliers (test)</option>
            <option value="/wrench.jpg">Wrench (test)</option>
            <option value="/drill.jpg">Drill (test)</option>
          </select>

          {/* <input
            type="file"
            name="image"
            accept="image/*"
            className="form-control w-full"
          /> */}

          <label className="mb-0 text-xs italic">Item name</label>
          <input
            name="name"
            type="text"
            placeholder="Quantum Wrench 1200/12ft"
            defaultValue={data?.short_name}
            className="form-control w-full"
          />
          <label className="mb-0 text-xs italic">Item description</label>
          <textarea
            name="desc"
            placeholder="..."
            defaultValue={data?.item_desc}
            className="form-control w-full"
          />
          <label className="mb-0 text-xs italic">Supplier</label>
          <select
            name="supplier_id"
            defaultValue={data?.supplier_id}
            className="form-control w-full"
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
            type="text"
            defaultValue={"*inventory across all locations, can't edit."}
            className="form-control w-full"
            readOnly
          />

          <label className="mb-0 text-xs italic">Threshold</label>
          <input
            name="threshold"
            type="number"
            placeholder="(e.g. 10, 20, 30...)"
            defaultValue={data?.order_threshold}
            className="w-full form-control"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="border flex-1 py-2 px-4 rounded mt-2 cursor-pointer"
            onClick={closeModal}
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
