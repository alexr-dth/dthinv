import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideMenu, LucideScanBarcode } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const sampleItem = {
  sku_number: 856320,
  internet_sku_number: 100124691,
  item_price: 2.2,
  inventory: -3,
  short_name: '1" EMT Straps 4-Pack',
}

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

  const checkIfItemExist = async (e, value) => {
    const vals = {}
    if (e !== null) {
      e.preventDefault()
      const form = e.target
      vals['btn'] = form.querySelector("button[type='submit']")
      vals['field'] = form.querySelector("input[type='text']")
      vals['btn'].disabled = true
      vals['field'].disabled = true
    }

    try {
      const scannedCode =
        vals['field']?.elements['item_barcode']?.value || value
      await new Promise((resolve) => setTimeout(resolve, 2000))
      if (scannedCode == sampleItem.sku_number) {
        setActiveModal({ name: 'confirmScan', data: sampleItem })
      } else {
        toast.error('Barcode not recognized')
      }
    } finally {
      if (e != null) {
        vals['field'].disabled = false
        vals['btn'].disabled = false
      }
    }
  }

  const addItemRequest = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector("button[type='submit']")
    btn.disabled = true
    try {
      const itemScannedCode = form.elements['item_barcode']?.value
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success('Added item request')
    } finally {
      closeModal()
      btn.disabled = false
    }
  }

  useEffect(() => {
    document.body.style.overflow = activeModal?.name ? 'hidden' : 'auto'
  }, [activeModal])

  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg">
            {activeModal.name == 'manualSearch' && (
              <ManualSearchModal
                confirmCallback={checkIfItemExist}
                cancelCallback={closeModal}
              />
            )}

            {activeModal.name == 'confirmScan' && (
              <ConfirmScanModal
                data={activeModal?.data}
                confirmCallback={addItemRequest}
                cancelCallback={closeModal}
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
        </div>

        <h2 className="page-title">Request Items</h2>

        <div className="grid place-content-center flex-grow-1">
          <div></div>

          <form onSubmit={checkIfItemExist} className="text-center">
            <div className="flex justify-center">
              <LucideScanBarcode size={128} />
            </div>
            <div className="text-gray-400 italic text-lg">
              Scan the item now...
            </div>
            <button
              type="button"
              className="action-link mt-3"
              onClick={() => setActiveModal({ name: 'manualSearch' })}
            >
              Manual
            </button>

            <button
              type="button"
              className="action-link !text-gray-400 underline block"
              onClick={() =>
                setActiveModal({ name: 'confirmScan', data: sampleItem })
              }
            >
              Simulate scanned item
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

// MODALS

const ManualSearchModal = ({ confirmCallback, cancelCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={confirmCallback}>
        <h3 className="font-semibold mb-3 text-xl">Manual search</h3>
        <div className="flex flex-col gap-1">
          <input
            name="item_barcode"
            type="text"
            placeholder="Type item code..."
            className="form-control"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn w-full" onClick={cancelCallback} type="button">
            Cancel
          </button>
          <button className="btn w-full" type="submit">
            Confirm
          </button>
        </div>
      </form>
    </div>
  )
}

const ConfirmScanModal = ({ data, confirmCallback, cancelCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={confirmCallback}>
        <h3 className="font-semibold mb-3 text-xl">Confirm scan</h3>
        <div className="rounded border p-2 mx-auto">
          <img
            src="missing.png"
            alt=""
            className="object-contain aspect-square w-full"
          />

          <div className="text-sm text-gray-600 font-semibold truncate">
            Home Depot
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
          <button className="btn flex-1" onClick={cancelCallback} type="button">
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
