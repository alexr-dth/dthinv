import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LucideMenu } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import { ReactSortable } from 'react-sortablejs'
import PageLoader from '@/components/PageLoader'

const depthColors = [
  'bg-blue-400 text-blue-900', // Level 1
  'bg-orange-300 text-orange-900', // Level 2
  'bg-teal-300 text-teal-900', // Level 3
  'bg-red-300 text-red-900', // Level 4
  'bg-green-300 text-green-900', // Level 5
  'bg-indigo-300 text-indigo-900', // Level 6
  'bg-yellow-300 text-yellow-900', // Level 7
  'bg-pink-300 text-pink-900', // Level 8
  'bg-purple-300 text-purple-900', // Level 9
  'bg-gray-300 text-gray-900', // Level 10
]

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

// emulate get api requests, change this later
const fetchLocations = async () => {
  return sampleLocations
}
// emulate post/patch/delete api requests, change this later
const addLocationMutation = async (newLocation) => {
  await new Promise((res) => setTimeout(res, 1000))
  sampleLocations.push(newLocation)
}

const editLocationMutation = async (newData) => {
  await new Promise((res) => setTimeout(res, 1000))
  const targetIndex = sampleLocations.findIndex(({ id }) => id == newData?.id)
  sampleLocations[targetIndex] = newData
}

// Helper
const buildTree = (data, parentId = '') => {
  return data
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(data, item.id),
    }))
}

// MAIN APP
export const Route = createFileRoute('/locations/')({
  component: RouteComponent,
})

function RouteComponent() {
  // Initial declaration for hooks
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
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  })

  const [list, setList] = useState(() => buildTree(data))

  useEffect(() => {
    setList(() => {
      console.log(buildTree(data))
      return buildTree(data)
    })
  }, [dataUpdatedAt])

  // React Query - for mutating/updating data via api
  const { mutateAsync: createLocation } = useMutation({
    mutationFn: addLocationMutation,
    onSuccess: () => queryClient.invalidateQueries(['locations']),
  })

  const { mutateAsync: patchLocation } = useMutation({
    mutationFn: editLocationMutation,
    onSuccess: () => queryClient.invalidateQueries(['locations']),
  })

  // Helpers - structuring data to be json-tree shape

  // Functions
  const closeModal = () => setActiveModal(null)

  const addLocation = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector("button[type='submit']")
    btn.disabled = true

    try {
      const newLocation = {
        id: Date.now().toString(),
        name: form.elements['name']?.value || '',
        barcode: form.elements['barcode']?.value || '',
        description: form.elements['description']?.value || '',
        notes: form.elements['notes']?.value || '',
        parentId: form.elements['parentId']?.value || '',
      }

      await createLocation(newLocation)
    } finally {
      closeModal()
      btn.disabled = false
    }
  }

  const editLocation = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector("button[type='submit']")
    btn.disabled = true

    try {
      const newData = {
        id: form.elements['id']?.value,
        name: form.elements['name']?.value,
        barcode: form.elements['barcode']?.value,
        description: form.elements['description']?.value,
        notes: form.elements['notes']?.value,
        parentId: form.elements['parentId']?.value,
      }

      console.log(newData)

      await patchLocation(newData)
    } finally {
      closeModal()
      btn.disabled = false
    }
  }
  // UI/UX
  if (isLoading) return <PageLoader />
  if (error) return <p>Error: {error.message}</p>
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg">
            {activeModal.name == 'addLocation' && (
              <AddLocationModal
                cancelCallback={closeModal}
                saveCallback={addLocation}
              />
            )}

            {activeModal.name == 'locationImage' && (
              <LocationImageModal cancelCallback={closeModal} />
            )}
            {activeModal.name == 'locationBarcode' && (
              <BarcodeModal
                data={activeModal.data}
                cancelCallback={closeModal}
              />
            )}
            {activeModal.name == 'editLocation' && (
              <EditLocationModal
                data={activeModal.data}
                cancelCallback={closeModal}
                saveCallback={editLocation}
              />
            )}
            {activeModal.name == 'addChildLocation' && (
              <AddChildLocationModal
                data={activeModal.data}
                cancelCallback={closeModal}
                saveCallback={addLocation}
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
        <h2 className="text-2xl text-center mb-3 font-bold">
          Warehouse Locations
        </h2>
        <button
          className="bg-gray-100 w-full p-2 text-center border rounded cursor-pointer"
          onClick={() => setActiveModal({ name: 'addLocation' })}
        >
          Add location
        </button>

        <button className="text-blue-500 mt-6 mb-2">Expand all</button>

        <ReactSortable
          className="space-y-3"
          list={list}
          setList={setList}
          animation={200}
          tag="ul"
        >
          {list.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              setActiveModal={setActiveModal}
            />
          ))}
        </ReactSortable>
      </div>
    </>
  )
}

// ADDITIONAL COMPONENTS
const TreeNode = ({ node, depth = 0, setActiveModal }) => {
  const [expanded, setExpanded] = useState(false)
  const [optionExpanded, setOptionExpanded] = useState(false)
  const [list, setList] = useState(node.children)
  useEffect(() => {
    setList(node.children)
  }, [node])
  return (
    <li
      className={`space-y-0.5 cursor-pointer`}
      onClick={(e) => {
        e.stopPropagation()
        setExpanded(!expanded)
      }}
    >
      <div
        className={`${depthColors[depth]} w-full border-2 p-2 rounded flex gap-2 border-gray-700 items-center`}
      >
        <strong className="truncate">{node.name}</strong>
        <span className="text-black/80 text-xs truncate">({node.barcode})</span>
        {!expanded && node.children?.length > 0 && (
          <span className="font-bold text-xs">
            +{node.children?.length} more locations
          </span>
        )}

        {/* actions */}
        <div className="ms-auto relative">
          <LucideMenu
            size={32}
            className=" p-1.5 ursor-pointer text-black"
            onClick={(e) => {
              e.stopPropagation()
              setOptionExpanded(!optionExpanded)
            }}
          />
          {optionExpanded && (
            <div className="absolute border bg-white shadow p-1 rounded right-full top-0">
              <div className="flex flex-col divide-y divide-gray-400">
                <Link
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                  }}
                  to="/locations/$locationId/items"
                  params={{ locationId: node.id }}
                >
                  View Items
                </Link>

                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                    setActiveModal({ name: 'locationImage', data: node })
                  }}
                >
                  Image
                </button>
                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                    setActiveModal({ name: 'locationBarcode', data: node })
                  }}
                >
                  Barcode
                </button>
                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                    setActiveModal({ name: 'editLocation', data: node })
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-lg py-1 px-3 text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                    setActiveModal({ name: 'addChildLocation', data: node })
                  }}
                >
                  Add section
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && node.children?.length > 0 && (
        <ReactSortable
          className="ms-3 space-y-1"
          list={list}
          setList={setList}
          animation={200}
          tag="ul"
        >
          {list.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              setActiveModal={setActiveModal}
            />
          ))}
        </ReactSortable>
      )}
    </li>
  )
}

// MODALS
const LocationImageModal = ({ cancelCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <img
        src="/warehouse.jpg"
        alt="warehouse image"
        className="aspect-square w-full max-w-screen max-h-screen object-contain"
      />
      <button
        className="border py-2 px-4 rounded mt-4 cursor-pointer w-full"
        onClick={cancelCallback}
      >
        Close
      </button>
    </div>
  )
}

const BarcodeModal = ({ data, cancelCallback }) => {
  const barcodeRef = useRef(null)

  useEffect(() => {
    if (data?.barcode && barcodeRef.current) {
      JsBarcode(barcodeRef.current, data.barcode, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 80,
        displayValue: true,
      })
    }
  }, [data?.barcode])

  return (
    <div className="bg-white rounded p-3 mx-3">
      <svg ref={barcodeRef} className="w-full"></svg>
      <button
        className="border py-2 px-4 rounded mt-4 cursor-pointer w-full"
        onClick={cancelCallback}
      >
        Close
      </button>
    </div>
  )
}

const EditLocationModal = ({ data, cancelCallback, saveCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={saveCallback} method="post">
        <h3 className="font-semibold mb-3 text-xl">
          Edit location information
        </h3>
        <input type="hidden" name="id" value={data?.id || ''} />
        <input type="hidden" name="parentId" value={data?.parentId || ''} />

        <div className="flex flex-col gap-1">
          <input
            type="text"
            name="name"
            placeholder="Location name"
            className="w-full border rounded p-2"
            defaultValue={data?.name || ''}
          />

          <textarea
            placeholder="Description"
            name="description"
            className="w-full border rounded p-2"
            defaultValue={data?.description || ''}
          />

          <textarea
            placeholder="Notes"
            name="notes"
            className="w-full border rounded p-2"
            defaultValue={data?.notes || ''}
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

const AddChildLocationModal = ({ data, saveCallback, cancelCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={saveCallback} method="post">
        <h3 className="font-semibold mb-3 text-xl">Add additional location</h3>

        <input type="hidden" name="parentId" value={data?.id} />

        <div className="flex flex-col gap-1">
          <input
            name="parent_code"
            type="text"
            className="w-full border rounded p-2 disabled:bg-gray-200 text-gray-500"
            value={data?.barcode + ' - parent'}
            disabled
          />

          <input
            name="name"
            type="text"
            placeholder="Location name"
            className="w-full border rounded p-2"
          />

          <textarea
            name="description"
            placeholder="Description"
            className="w-full border rounded p-2"
          />

          <textarea
            name="notes"
            placeholder="Notes"
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

const AddLocationModal = ({ saveCallback, cancelCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={saveCallback} method="post">
        <h3 className="font-semibold  mb-3 text-xl">Add location</h3>
        <div className="flex flex-col gap-1 ">
          <input
            name="name"
            type="text"
            placeholder="Location name"
            className="w-full border rounded p-2"
          />

          <textarea
            name="description"
            placeholder="Description"
            className="w-full border rounded p-2"
          />

          <textarea
            name="notes"
            placeholder="Notes"
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
