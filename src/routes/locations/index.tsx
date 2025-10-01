import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Children, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ReactSortable } from 'react-sortablejs'
import {
  addLocationMutation,
  editLocationMutation,
  fetchLocationsFormatted,
  removeLocationMutation,
} from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import { LucideGripVertical, LucideMenu } from 'lucide-react'
import JsBarcode from 'jsbarcode'

export const Route = createFileRoute('/locations/')({
  component: RouteComponent,
})

// use modulo to cycle 0-9
const depthColors = [
  'not-only:bg-blue-100 border-s-blue-500 text-blue-900', // Level 1
  'not-only:bg-orange-100 border-s-orange-500 text-orange-900', // Level 2
  'not-only:bg-teal-100 border-s-teal-500 text-teal-900', // Level 3
  'not-only:bg-red-100 border-s-red-500 text-red-900', // Level 4
  'not-only:bg-green-100 border-s-green-500 text-green-900', // Level 5
  'not-only:bg-indigo-100 border-s-indigo-500 text-indigo-900', // Level 6
  'not-only:bg-yellow-100 border-s-yellow-500 text-yellow-900', // Level 7
  'not-only:bg-pink-100 border-s-pink-500 text-pink-900', // Level 8
  'not-only:bg-purple-100 border-s-purple-500 text-purple-900', // Level 9
  'not-only:bg-gray-100 border-s-gray-500 text-gray-900', // Level 10
]

const reverseTree = (tree) => {
  const result = []
  const traverse = (nodes) => {
    for (const node of nodes) {
      const { children, ...rest } = node
      result.push(rest)
      if (children && children.length) {
        traverse(children)
      }
    }
  }
  traverse(tree)
  return result
}

function RouteComponent() {
  const [expandAll, setExpandAll] = useState(false)
  const [expandedById, setExpandedById] = useState({})
  const [activeModal, setActiveModal] = useState(null)
  const [list, setList] = useState([])

  const {
    data: locations = [],
    isLoading,
    error,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['locations', 'formatted'],
    queryFn: fetchLocationsFormatted,
  })

  useEffect(() => {
    setExpandedById((prev) => {
      const next = {}
      locations.forEach(({ id }) => {
        next[id] = prev[id] ?? false
      })
      return next
    })
    setList(locations)
  }, [dataUpdatedAt])

  useEffect(() => {
    setExpandedById((prev) => {
      const next = {}
      for (const key in prev) {
        next[key] = expandAll
      }
      return next
    })
  }, [expandAll])

  const { mutateAsync: patchLocationWeight } = useMutation({
    mutationFn: editLocationMutation,
  })
  const handleOrderChange = async (evt, listed) => {
    try {
      const { oldIndex, newIndex } = evt
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex
      )
        return
      const moved = { ...listed[oldIndex] }
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
      await patchLocationWeight({
        id: moved.id,
        order_weight: moved.order_weight,
      })
    } catch (err) {
      toast.error('Error updating server')
    }
  }

  const closeModal = () => setActiveModal(null)
  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {activeModal.name == 'addLocation' && (
              <AddLocationModal
                data={activeModal.data}
                closeModal={closeModal}
              />
            )}

            {activeModal.name == 'editLocation' && (
              <EditLocationModal
                data={activeModal.data}
                closeModal={closeModal}
              />
            )}

            {activeModal.name == 'locationImage' && (
              <LocationImageModal
                data={activeModal.data}
                closeModal={closeModal}
              />
            )}
            {activeModal.name == 'locationBarcode' && (
              <BarcodeModal data={activeModal.data} closeModal={closeModal} />
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

          <button
            className="action-link"
            onClick={() => {
              setExpandAll(!expandAll)
            }}
          >
            {expandAll ? 'Collapse' : 'Expand'} All
          </button>
        </div>
        <ReactSortable
          list={list}
          setList={setList}
          className="space-y-1"
          animation={150}
          onEnd={(evt) => handleOrderChange(evt, list)}
        >
          {list.map((childData) => (
            <ExpandableRow
              closeModal={closeModal}
              setActiveModal={setActiveModal}
              expandAll={expandAll}
              key={childData.id}
              data={childData}
              childList={childData.children}
              expanded={expandedById[childData.id]}
              toggleExpand={() =>
                setExpandedById((prev) => ({
                  ...prev,
                  [childData.id]: !prev[childData.id],
                }))
              }
            />
          ))}
        </ReactSortable>
      </div>
    </>
  )
}

const ExpandableRow = ({
  closeModal,
  setActiveModal,
  expandAll,
  data,
  childList = [],
  expanded = false,
  toggleExpand,
  depth = 0,
}) => {
  const [expandedById, setExpandedById] = useState({})
  const [menuExpanded, setMenuExpanded] = useState(false)
  const queryClient = useQueryClient()

  const [list, setList] = useState([])

  useEffect(() => {
    setExpandedById((prev) => {
      const next = {}
      childList.forEach(({ id }) => {
        next[id] = prev[id] ?? false
      })
      return next
    })
    setList(childList)
  }, [childList])

  useEffect(() => {
    setExpandedById((prev) => {
      const next = {}
      for (const key in prev) {
        next[key] = expandAll
      }
      return next
    })
  }, [expandAll])

  const { mutateAsync: deleteLocation } = useMutation({
    mutationFn: removeLocationMutation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['locations', 'formatted'] }),
  })
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

  const { mutateAsync: patchLocationWeight } = useMutation({
    mutationFn: editLocationMutation,
  })

  const handleOrderChange = async (evt, listed) => {
    try {
      const { oldIndex, newIndex } = evt
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex
      )
        return
      const moved = { ...listed[oldIndex] }
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
      await patchLocationWeight({
        id: moved.id,
        order_weight: moved.order_weight,
      })
    } catch (err) {
      toast.error('Error updating server')
    }
  }

  return (
    <div className="ms-2">
      <h5
        className={`${depthColors[depth % 10]} cursor-grab border-s-5 pe-1 py-1 not-only:font-semibold flex gap-2 items-center`}
        onClick={toggleExpand}
      >
        <LucideGripVertical size={16}  />
        <strong className="truncate">{data.name}</strong>

        <span className="text-black/40 text-xs truncate">
          ({data.barcode_qr})
        </span>

        {!expanded && childList.length > 0 && (
          <span className="font-bold text-xs">+{childList.length} more</span>
        )}

        {/* actions */}
        <div className="ms-auto relative">
          <LucideMenu
            size={24}
            className="cursor-pointer "
            onClick={(e) => {
              e.stopPropagation()
              setMenuExpanded(!menuExpanded)
            }}
          />
          {menuExpanded && (
            <div className="absolute border border-gray-400 bg-white shadow p-1 rounded right-full top-0 font-normal">
              <div className="flex flex-col divide-y divide-gray-400">
                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuExpanded(false)
                    setActiveModal({ name: 'locationBarcode', data: data })
                  }}
                >
                  Barcode
                </button>

                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuExpanded(false)
                    setActiveModal({ name: 'locationImage', data: data })
                  }}
                >
                  Image
                </button>

                <Link
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuExpanded(false)
                  }}
                  to="/locations/$locationId/items"
                  params={{ locationId: data.id }}
                >
                  View Items
                </Link>

                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuExpanded(false)
                    setActiveModal({ name: 'addLocation', data: data })
                  }}
                >
                  Add section
                </button>

                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-black text-nowrap cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuExpanded(false)
                    setActiveModal({ name: 'editLocation', data: data })
                  }}
                >
                  Edit
                </button>

                <button
                  className="text-lg py-1 px-3 disabled:line-through disabled:cursor-not-allowed disabled:opacity-50  text-red-500 text-nowrap cursor-pointer"
                  onClick={async (e) => {
                    e.stopPropagation()
                    await handleRemoveLocation(e, data?.id || null)
                    setMenuExpanded(false)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </h5>
      {childList.length > 0 && expanded && (
        <ReactSortable
          list={list}
          setList={setList}
          className="space-y-1 mt-2 mb-4"
          animation={150}
          onEnd={(evt) => handleOrderChange(evt, list)}
        >
          {list.map((childData) => (
            <ExpandableRow
              setActiveModal={setActiveModal}
              closeModal={closeModal}
              expandAll={expandAll}
              key={childData.id}
              data={childData}
              childList={childData.children}
              expanded={expandedById[childData.id]}
              toggleExpand={() =>
                setExpandedById((prev) => ({
                  ...prev,
                  [childData.id]: !prev[childData.id],
                }))
              }
              depth={depth + 1}
            />
          ))}
        </ReactSortable>
      )}
    </div>
  )
}

const AddLocationModal = ({ data = null, closeModal }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: createLocation } = useMutation({
    mutationFn: addLocationMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  })

  const handleAddLocation = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector("button[type='submit']")
    btn.disabled = true

    try {
      await createLocation({
        name: form.elements['name']?.value,
        barcode_qr: form.elements['barcode_qr']?.value,
        description: form.elements['description']?.value,
        notes: form.elements['notes']?.value,
        parent_id: form.elements['parentId']?.value || null,
        order_weight: Date.now(),
      })
      closeModal()
      toast.success('Location created')
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={handleAddLocation} method="post">
        <h3 className="font-semibold  mb-3 text-xl">
          Add {data != null && 'additional'} location
        </h3>
        <div className="flex flex-col gap-1 ">
          <input type="hidden" name="parentId" value={data?.id} />

          {data?.id && (
            <input
              type="text"
              className="w-full border rounded p-2 disabled:bg-gray-200 text-gray-500"
              value={data?.name + ' - under'}
              disabled
            />
          )}

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
          <button className="btn flex-1" onClick={closeModal} type="button">
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

const EditLocationModal = ({ data, closeModal }) => {
  const queryClient = useQueryClient()

  const { mutateAsync: patchLocation } = useMutation({
    mutationFn: editLocationMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  })

  const handleEditLocation = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = form.querySelector("button[type='submit']")
    btn.disabled = true
    try {
      await toast.promise(
        patchLocation({
          id: form.elements['id']?.value,
          name: form.elements['name']?.value,
          barcode_qr: form.elements['barcode_qr']?.value,
          description: form.elements['description']?.value,
          notes: form.elements['notes']?.value,
        }),
        {
          loading: 'Loading',
          success: 'Location updated',
          error: 'Process failed',
        },
      )
      closeModal()
    } catch (error) {
      console.log(error)
    } finally {
      btn.disabled = false
    }
  }

  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={handleEditLocation} method="post">
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
          <button className="btn flex-1" onClick={closeModal} type="button">
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

const BarcodeModal = ({ data, closeModal }) => {
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
        onClick={closeModal}
      >
        Close
      </button>
    </div>
  )
}

const LocationImageModal = ({ data, closeModal }) => {
  return (
    <div className="bg-white rounded p-3 mx-3">
      <img
        src={data?.image || '/missing.png'}
        alt="warehouse image"
        className="aspect-square w-full max-w-screen max-h-screen object-contain"
      />
      <button
        className="border py-2 px-4 rounded mt-4 cursor-pointer w-full"
        onClick={closeModal}
      >
        Close
      </button>
    </div>
  )
}
