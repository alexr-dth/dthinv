import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Flag, LucideScanBarcode } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import {
  addRequestMutation,
  fetchItems,
  fetchPaginatedItems,
  showItem,
} from '@/api/api'
import GridProductCard from '@/components/Cards/Products/GridProductCard'
import usePaginatedQuery from '@/hooks/usePaginatedQuery'
import ItemSearchBarWithFilters from '@/components/Search/ItemSearchBarWithFilters'

export const Route = createFileRoute('/request')({
  component: RouteComponent,
})

function RouteComponent() {
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  useEffect(() => {
    // Handlers
    const handleScan = (e) => {
      const scannedValue = e.detail.value
      console.log(scannedValue)
      checkIfItemExist(null, scannedValue)
    }

    const handleBtn1 = () => console.log('PDA_BUTTON_1_PRESSED!')
    const handleBtn2 = () => console.log('PDA_BUTTON_2_PRESSED!')
    const handleBtn3 = () => console.log('PDA_BUTTON_3_PRESSED!')
    const handleBtn4 = () => console.log('PDA_BUTTON_4_PRESSED!')

    // Add listeners
    document.addEventListener('PDA_SCAN', handleScan)
    document.addEventListener('PDA_BUTTON_1', handleBtn1)
    document.addEventListener('PDA_BUTTON_2', handleBtn2)
    document.addEventListener('PDA_BUTTON_3', handleBtn3)
    document.addEventListener('PDA_BUTTON_4', handleBtn4)

    // Cleanup: remove on unmount
    return () => {
      document.removeEventListener('PDA_SCAN', handleScan)
      document.removeEventListener('PDA_BUTTON_1', handleBtn1)
      document.removeEventListener('PDA_BUTTON_2', handleBtn2)
      document.removeEventListener('PDA_BUTTON_3', handleBtn3)
      document.removeEventListener('PDA_BUTTON_4', handleBtn4)
    }
  }, [])

  const closeModal = () => setActiveModal(null)

  const checkIfItemExist = async (e, manualValue) => {
    e?.preventDefault()
    const form = e?.target
    const btn = form?.querySelector("button[type='submit']")
    const field = form?.querySelector("input[type='text']")

    btn && (btn.disabled = true)
    field && (field.disabled = true)

    try {
      const formValue = field?.value || null

      const scannedCode = manualValue || formValue
      const scannedData = await showItem(scannedCode)

      // don't cache the data, it's better to always check
      setActiveModal({ name: 'confirmScan', data: scannedData })
    } catch (error) {
      console.log(error)
      if (error.status?.toString().startsWith('4'))
        toast.error('Barcode not recognized')
      else toast.error('Process failed')
    } finally {
      btn && (btn.disabled = false)
      field && (field.disabled = false)
    }
  }

  useEffect(() => {
    document.body.style.overflow = activeModal?.name ? 'hidden' : 'auto'
  }, [activeModal])

  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {activeModal.name == 'manualSearch' && (
              <ManualSearchModal
                confirmCallback={checkIfItemExist}
                closeModal={closeModal}
              />
            )}

            {activeModal.name == 'confirmScan' && (
              <ConfirmScanModal
                data={activeModal?.data}
                closeModal={closeModal}
              />
            )}
          </div>
        </div>
      )}

      <div className="sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3 h-dvh flex flex-col">
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
          <button
            className="action-link"
            onClick={() => setActiveModal({ name: 'manualSearch' })}
          >
            Manual
          </button>
        </div>

        <h2 className="page-title">Request Items</h2>

        <div className="grid place-content-center flex-grow-1">
          <div></div>

          <div className="text-center">
            <div className="flex justify-center">
              <LucideScanBarcode size={128} />
            </div>
            <div className="text-gray-400 italic text-lg">
              Scan the barcode now...
            </div>

            {/* <button
              className="action-link !text-gray-400 underline block"
              onClick={(e) =>
                checkIfItemExist(e, '023187f4-fcf2-4c9d-a57e-d619f87109ef')
              }
            >
              Simulate scanned item
            </button> */}
          </div>
        </div>
      </div>
    </>
  )
}

// MODALS
const ManualSearchModal = ({ confirmCallback, closeModal }) => {
  const { t } = useTranslation()
  const [newSupplierModal, openSupplierModal] = useState(false)
  const [filteredData, setFilteredData] = useState([])

  const {
    data = {},
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    dataUpdatedAt,
  } = usePaginatedQuery({
    queryKey: ['items', 'paginated'],
    queryFn: fetchPaginatedItems,
    enabled: newSupplierModal,
  })

  const itemsData = data?.items ?? []
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setFilteredData(itemsData)
  }, [dataUpdatedAt])

  return (
    <>
      {newSupplierModal && (
        <div className="fixed w-full h-full  bg-black/60 top-0 left-0 place-content-center grid z-200">
          <div className="w-dvw max-w-md">
            <div className="bg-white rounded p-3 mx-3 max-h-[95lvh] overflow-auto">
              <div className="flex justify-between items-center">
                <h3 className="modal-title">All items</h3>
              </div>
              <ItemSearchBarWithFilters
                originalData={itemsData}
                setFilteredData={setFilteredData}
              />
              <div className="space-y-8 max-h-[60lvh] overflow-auto py-4 border-y border-gray-400 px-2">
                <div className="grid grid-cols-2 gap-2">
                  {filteredData?.map((item, index) => (
                    <GridProductCard
                      key={item.id || index}
                      data={item}
                      actions={{
                        primary: {
                          cb: () => {
                            openSupplierModal(false)
                            confirmCallback(null, item.id)
                          },
                          label: 'Select',
                        },
                      }}
                    />
                  ))}
                </div>
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

              <div className="flex gap-2 mt-4">
                <button
                  className="btn flex-1"
                  onClick={() => openSupplierModal(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded p-3 mx-3">
        <form onSubmit={confirmCallback}>
          <div className="flex mb-3">
            <h3 className="modal-title">Manual search</h3>
            <button
              className="action-link underline  block ms-auto"
              type="button"
              onClick={() => openSupplierModal(true)}
            >
              Browse Items
            </button>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <input
              name="item_barcode"
              type="text"
              placeholder="Type item code..."
              className="form-control"
            />
          </div>

          <div className="flex justify-end gap-2 ">
            <button className="btn w-full" onClick={closeModal} type="button">
              Cancel
            </button>
            <button className="btn w-full" type="submit">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

const ConfirmScanModal = ({ data, closeModal }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutateAsync: createRequest } = useMutation({
    mutationFn: addRequestMutation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['requested-items'] }),
  })

  const handleAddRequest = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true
    try {
      await createRequest({
        item_id: data.id,
        requested_price: data.item_price,
        quoted_price: data.item_price,
        requested_quantity: data.default_order_qty,
        quoted_quantity: data.default_order_qty,
        type: 'manual',
        request_status: 'pending',
        requester_id: 'd847766a-c8ca-461b-abc3-c45b5a11e710', // John Doe
      })
      closeModal()
      toast.success('Added request')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={handleAddRequest}>
        <h3 className="modal-title">Confirm scan</h3>
        <div className="rounded border p-2 mx-auto">
          <img
            src={data.item_image || '/missing.png'}
            alt=""
            className="object-contain aspect-square w-full"
          />

          <div className="text-sm text-gray-600 font-semibold truncate">
            {data.supplier?.name}
          </div>

          <div className="text-xl leading-5 line-clamp-2 ">
            {data.short_name}
          </div>

          <div className="flex items-center mt-2">
            <div>
              <div className="text-sm text-gray-500 font-medium tracking-wide truncate">
                {data.sku_number}
              </div>
              <div className="text-sm text-gray-400 truncate">
                {data.internet_sku_number}
              </div>
            </div>

            <div className="ms-auto text-3xl font-bold text-gray-800 truncate">
              ${data.item_price}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn flex-1" onClick={closeModal} type="button">
            Cancel
          </button>

          <button className="btn flex-1" type="submit">
            Confirm
          </button>
        </div>
      </form>
    </div>
  )
}
