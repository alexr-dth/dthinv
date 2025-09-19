import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const sampleLocations = [
  {
    id: '1',
    name: 'Main Warehouse',
    barcode: 'WH-001',
    parentId: '',
    description: 'Primary warehouse facility storing all inventory.',
    notes: 'Access restricted to authorized staff only.',
  },
  {
    id: '2',
    name: 'Zone A',
    barcode: 'WH-001-ZA',
    parentId: '1',
    description: 'Zone A for general merchandise and fast-moving items.',
    notes: 'Ensure daily restocking checks.',
  },
  {
    id: '3',
    name: 'Zone B',
    barcode: 'WH-001-ZB',
    parentId: '1',
    description: 'Zone B reserved for bulk storage and seasonal goods.',
    notes: 'Temperature monitoring required.',
  },
  {
    id: '4',
    name: 'Aisle A1',
    barcode: 'WH-001-ZA-A1',
    parentId: '2',
    description: 'Aisle A1 for packaged food items.',
    notes: 'Check for expiry dates during audits.',
  },
  {
    id: '5',
    name: 'Aisle A2',
    barcode: 'WH-001-ZA-A2',
    parentId: '2',
    description: 'Aisle A2 dedicated to cleaning supplies.',
    notes: 'Ensure chemical safety protocols are followed.',
  },
  {
    id: '6',
    name: 'Rack A1-01',
    barcode: 'WH-001-ZA-A1-R01',
    parentId: '4',
    description: 'Rack A1-01 for beverages.',
    notes: 'Heavy load — confirm rack weight capacity weekly.',
  },
  {
    id: '7',
    name: 'Rack A1-02',
    barcode: 'WH-001-ZA-A1-R02',
    parentId: '4',
    description: 'Rack A1-02 for snack foods.',
    notes: 'Rotate stock to prevent expired products.',
  },
  {
    id: '8',
    name: 'Bin A1-01-01',
    barcode: 'WH-001-ZA-A1-R01-B01',
    parentId: '6',
    description: 'Bin for bottled water storage.',
    notes: 'High turnover — replenish twice a week.',
  },
  {
    id: '9',
    name: 'Bin A1-01-02',
    barcode: 'WH-001-ZA-A1-R01-B02',
    parentId: '6',
    description: 'Bin for canned soda storage.',
    notes: 'Keep away from direct sunlight.',
  },
]

export const Route = createFileRoute('/receive')({
  component: RouteComponent,
})

function RouteComponent() {
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  useEffect(() => {
    const handleScan = (e) => {
      const scannedValue = e.detail.value
      console.log(scannedValue)
      // checkIfItemExist(null, scannedValue)
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
  })

  const closeModal = () => setActiveModal(null)

  const searchCode = async (e) => {
    e.preventDefault()
    const form = e.target
    try {
      const scannedCode = form.elements['scanned_code']?.value
      const location = sampleLocations.find(
        ({ barcode }) => barcode === scannedCode,
      )
      if (location) {
        setActiveModal({ name: 'itemScanner', data: location })
      } else {
        alert('No matching location found.')
      }
    } finally {
    }
  }

  const addItemToLocation = (e, setHistory) => {
    e.preventDefault()
    const form = e.target
    try {
      const itemScannedCode = form.elements['item_barcode']?.value
      const locationScannedCode = form.elements['location_barcode']?.value
      if (itemScannedCode) {
        alert(
          `Item "${itemScannedCode}" was added to "${locationScannedCode}" location`,
        )
        form.elements['item_barcode'].value = ''
        setHistory((prev) => [
          `Item "${itemScannedCode}" was added to "${locationScannedCode}" location`,
          ...prev,
        ])
      } else {
        alert('No item detected.')
      }
    } finally {
    }
  }

  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {activeModal.name == 'itemScanner' && (
              <ItemScannerModal
                data={activeModal?.data}
                successCallback={addItemToLocation}
                cancelCallback={closeModal}
              />
            )}
          </div>
        </div>
      )}

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

        <h2 className="page-title">Receive Items</h2>

        <div>
          <form onSubmit={searchCode}>
            <input
              type="text"
              name="scanned_code"
              placeholder="Scan or type location code..."
              className="w-full border rounded p-2"
            />

            <button
              className="border py-2 px-4 rounded mt-4 cursor-pointer w-full"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

// MODALS

const ItemScannerModal = ({ data, successCallback, cancelCallback }) => {
  const [history, setHistory] = useState([])
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={(e) => successCallback(e, setHistory)}>
        <h3 className="font-semibold mb-3 text-xl">Scan item</h3>
        <div className="flex flex-col gap-1">
          <input
            name="location_barcode"
            type="text"
            value={data?.barcode + ' - selected location'}
            placeholder="Location name"
            className="w-full border rounded p-2 disabled:bg-gray-200 text-gray-500"
            disabled
          />

          <input
            name="item_barcode"
            type="text"
            placeholder="Scan or type item code..."
            className="w-full border rounded p-2"
          />
        </div>

        <button type="submit" className="hidden"></button>

        <div className="flex justify-end gap-2">
          <button
            className="border py-2 px-4 rounded mt-4 cursor-pointer w-full"
            onClick={cancelCallback}
            type="button"
          >
            Close
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <ul className="list-disc list-inside max-h-44 overflow-auto mt-3">
          {history.map((text, i) => (
            <li key={i} className="text-gray-500 text-sm">
              {text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
