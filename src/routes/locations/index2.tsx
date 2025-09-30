import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LucideGripVertical, LucideMenu } from 'lucide-react'
import JsBarcode from 'jsbarcode'
import { ReactSortable } from 'react-sortablejs'
import PageLoader from '@/components/PageLoader'
import {
  addLocationMutation,
  editLocationMutation,
  fetchLocationsFormatted,
  removeLocationMutation,
} from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import ItemSearchBarWithFilters from '@/components/Search/ItemSearchBarWithFilters'
import toast from 'react-hot-toast'

const depthColors = [
  'bg-blue-300 text-blue-900', // Level 1
  'bg-orange-200 text-orange-900', // Level 2
  'bg-teal-200 text-teal-900', // Level 3
  'bg-red-200 text-red-900', // Level 4
  'bg-green-200 text-green-900', // Level 5
  'bg-indigo-200 text-indigo-900', // Level 6
  'bg-yellow-200 text-yellow-900', // Level 7
  'bg-pink-200 text-pink-900', // Level 8
  'bg-purple-200 text-purple-900', // Level 9
  'bg-gray-200 text-gray-900', // Level 10
]

// Helper
const sortOrder = (data) =>
  (data || []).sort((a, b) => a.order_weight - b.order_weight)

// MAIN APP
export const Route = createFileRoute('/locations/index2')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()

  const [expandedAll, setExpandedAll] = useState(false)
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const {
    data: locations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocationsFormatted,
    select: (fetched) => sortOrder(fetched), // already cached, no need to memoized
  })

  const [list, setList] = useState([])

  useEffect(() => {
    setList(locations || [])
  }, [locations])

  const { mutateAsync: createLocation } = useMutation({
    mutationFn: addLocationMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  })

  const { mutateAsync: patchLocation } = useMutation({
    mutationFn: editLocationMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  })

  const { mutateAsync: patchLocationWeight } = useMutation({
    mutationFn: editLocationMutation,
  })

  const { mutateAsync: deleteLocation } = useMutation({
    mutationFn: removeLocationMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  })

  const closeModal = () => setActiveModal(null)

  const handleAddLocation = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector("button[type='submit']")
    btn.disabled = true

    try {
      const newLocation = {
        name: form.elements['name']?.value,
        barcode_qr: form.elements['barcode_qr']?.value,
        description: form.elements['description']?.value,
        notes: form.elements['notes']?.value,
        parent_id: form.elements['parentId']?.value || null,
        order_weight: Date.now(),
      }
      await createLocation(newLocation)
      closeModal()
      toast.success('Location created')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  const handleEditLocation = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector("button[type='submit']")
    btn.disabled = true
    try {
      await patchLocation({
        id: form.elements['id']?.value,
        name: form.elements['name']?.value,
        barcode_qr: form.elements['barcode_qr']?.value,
        description: form.elements['description']?.value,
        notes: form.elements['notes']?.value,
      })
      closeModal()
      toast.success('Location updated')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  const handleRemoveLocation = async (e, id) => {
    e.preventDefault()
    const btn = e.target
    btn.disabled = true
    try {
      await deleteLocation(id)
      closeModal()
      toast.success('Location deleted')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  const handleOrderChange = async (evt, listed) => {
    try {
      const { oldIndex, newIndex } = evt
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex
      )
        return
      const moved = listed[oldIndex]
      const targetIndex = newIndex > oldIndex ? newIndex + 1 : newIndex

      const before = listed[targetIndex - 1] ?? null
      const after = listed[targetIndex] ?? null

      if (!after) {
        moved.order_weight = before.order_weight + 1
      } else if (!before) {
        moved.order_weight = after.order_weight - 1
      } else {
        let tempWeight

        if (before.order_weight + 1 < after.order_weight) {
          tempWeight = before.order_weight + 1
        } else {
          tempWeight = (before.order_weight + after.order_weight) / 2
        }
        moved.order_weight = tempWeight
      }

      moved.children = undefined
      moved.chosen = undefined
      moved.selected = undefined
      await patchLocationWeight(moved)
    } catch (err) {
      toast.error('Server error')
    }
  }

  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {activeModal.name == 'addLocation' && (
              <AddLocationModal
                cancelCallback={closeModal}
                saveCallback={handleAddLocation}
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
                saveCallback={handleEditLocation}
              />
            )}
            {activeModal.name == 'addChildLocation' && (
              <AddChildLocationModal
                data={activeModal.data}
                cancelCallback={closeModal}
                saveCallback={handleAddLocation}
              />
            )}
          </div>
        </div>
      )}

      <div className="page-container">
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
        <h2 className="page-title">Warehouse Locations</h2>

        <div
          id="title-buttons"
          className="divide-x mt-6 mb-2 text-nowrap overflow-auto pb-2"
        >
          <button
            className="action-link"
            onClick={() => setActiveModal({ name: 'addLocation' })}
          >
            Add Location
          </button>

          <button className="action-link" onClick={() => setExpandedAll(true)}>
            Expand
          </button>

          <button className="action-link" onClick={() => setExpandedAll(false)}>
            Collapse
          </button>
        </div>

        {/* TODO: Change this component to something that will make sense in this context */}
        {/* <ItemSearchBarWithFilters
          originalData={[]}
          setFilteredData={() => {}}
        /> */}

        <ReactSortable
          className="space-y-3"
          list={list}
          setList={setList}
          animation={200}
          tag="ul"
          onEnd={(evt) => handleOrderChange(evt, list)}
        >
          {list.map((node) => (
            <LocationNode
              key={node.id}
              node={node}
              setActiveModal={setActiveModal}
              handleOrderChange={handleOrderChange}
              handleRemoveLocation={handleRemoveLocation}
              expandedToggle={expandedAll}
              className={node.children?.length < 1 ? 'mb-0.5' : ''}
            />
          ))}
        </ReactSortable>
      </div>
    </>
  )
}

// ADDITIONAL COMPONENTS
const LocationNode = ({
  node,
  depth = 0,
  setActiveModal,
  handleOrderChange,
  handleRemoveLocation,
  expandedToggle,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(expandedToggle)
  const [optionExpanded, setOptionExpanded] = useState(false)
  const [list, setList] = useState(node.children)
  useEffect(() => {
    setList(node.children)
  }, [node])

  useEffect(() => {
    setExpanded(expandedToggle)
  }, [expandedToggle])

  return (
    <li
      className={`space-y-0.5 cursor-move ` + className}
      onClick={(e) => {
        e.stopPropagation()
        setExpanded(!expanded)
      }}
    >
      <div
        className={`${depthColors[depth]} w-full border-2 p-2 rounded flex gap-2 border-gray-700 items-center`}
      >
        <LucideGripVertical size={16} />
        <strong className="truncate">{node.name}</strong>
        <span className="text-black/80 text-xs truncate">
          ({node.barcode_qr})
        </span>
        {!expanded && node.children?.length > 0 && (
          <span className="font-bold text-xs">
            +{node.children?.length} more locations
          </span>
        )}

        {/* actions */}
        <div className="ms-auto relative">
          <LucideMenu
            size={32}
            className=" p-1.5 cursor-pointer text-black"
            onClick={(e) => {
              e.stopPropagation()
              setOptionExpanded(!optionExpanded)
            }}
          />
          {optionExpanded && (
            <div className="absolute border bg-white shadow p-1 rounded right-full top-0">
              <div className="flex flex-col divide-y divide-gray-400">
                <Link
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
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
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                    setActiveModal({ name: 'locationImage', data: node })
                  }}
                >
                  Image
                </button>
                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                    setActiveModal({ name: 'locationBarcode', data: node })
                  }}
                >
                  Barcode
                </button>
                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                    setActiveModal({ name: 'editLocation', data: node })
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionExpanded(false)
                    setActiveModal({ name: 'addChildLocation', data: node })
                  }}
                >
                  Add section
                </button>

                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-red-500 text-nowrap cursor-pointer"
                  onClick={async (e) => {
                    e.stopPropagation()
                    await handleRemoveLocation(e, node?.id || null)
                    setOptionExpanded(false)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && node.children?.length > 0 && (
        <ReactSortable
          className="ms-3 space-y-2"
          list={list}
          setList={setList}
          animation={200}
          tag="ul"
          onEnd={(evt) => handleOrderChange(evt, list)}
        >
          {sortOrder(list).map((child) => (
            <LocationNode
              key={child.id}
              node={child}
              depth={depth + 1}
              setActiveModal={setActiveModal}
              handleOrderChange={handleOrderChange}
              expandedToggle={expandedToggle}
              className={child.children?.length < 1 ? 'mb-0.5' : ''}
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
    if (data?.barcode_qr && barcodeRef.current) {
      JsBarcode(barcodeRef.current, data.barcode_qr, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 80,
        displayValue: true,
      })
    }
  }, [data?.barcode_qr])

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

const AddLocationModal = ({ saveCallback, cancelCallback }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={saveCallback} method="post">
        <h3 className="font-semibold  mb-3 text-xl">Add location</h3>
        <div className="flex flex-col gap-1 ">
          <input type="hidden" name="parentId" />
          <input
            name="name"
            type="text"
            placeholder="Location name"
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
          <button className="btn flex-1" onClick={cancelCallback} type="button">
            Close
          </button>
          <button className="btn flex-1" type="submit">
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
        <div className="flex flex-col gap-1">
          <input type="hidden" name="parentId" value={data?.id} />

          <input
            type="text"
            className="w-full border rounded p-2 disabled:bg-gray-200 text-gray-500"
            value={data?.name + ' - under'}
            disabled
          />

          <input
            name="name"
            type="text"
            placeholder="Location name"
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
          <button className="btn flex-1" onClick={cancelCallback} type="button">
            Close
          </button>
          <button className="btn flex-1" type="submit">
            Save
          </button>
        </div>
      </form>
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
        <input type="hidden" name="id" value={data?.id} />
        <input type="hidden" name="parentId" value={data?.parent_id} />

        <div className="flex flex-col gap-1">
          <input
            type="text"
            name="name"
            placeholder="Location name"
            className="w-full border rounded p-2"
            defaultValue={data?.name || ''}
            required
          />

          <input
            type="text"
            name="barcode_qr"
            placeholder="QR Code"
            className="w-full border rounded p-2"
            defaultValue={data?.barcode_qr || ''}
            required
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
          <button className="btn flex-1" onClick={cancelCallback} type="button">
            Close
          </button>
          <button className="btn flex-1" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
