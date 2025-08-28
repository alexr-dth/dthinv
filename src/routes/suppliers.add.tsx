import { addItemMutation, addSupplierMutation } from '@/api/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/suppliers/add')({
  component: RouteComponent,
})

function RouteComponent() {
  const [expanded, setExpanded] = useState(-1)
  const [items, setItems] = useState([])
  const [supplierName, setSupplierName] = useState('')
  const queryClient = useQueryClient()

  const { mutateAsync: createSupplier } = useMutation({
    mutationFn: addSupplierMutation,
    onSuccess: () => queryClient.invalidateQueries(['suppliers']),
  })

  const { mutateAsync: createItem } = useMutation({
    mutationFn: addItemMutation,
    onSuccess: () => queryClient.invalidateQueries(['items']),
  })

  const addSupplierWithItems = async (e) => {
    if (!supplierName.length) return toast.error('Invalid supplier name')

    const btn = e.target
    btn.disabled = true

    try {
      const newItems = items
        .filter(({ name }) => !!name)
        .map((i) => ({ ...i, supplier: supplierName }))

      await createSupplier({ name: supplierName })
      await createItem(newItems)
    } finally {
      toast.success('Added supplier')
      btn.disabled = false
    }
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((p) => p.id != id))
  }

  const handleExpand = (id) => {
    setExpanded(id == expanded ? -1 : id)
  }
  const handleFieldUpdate = ({ target }, id) => {
    const { name, value } = target
    setItems((prev) =>
      prev.map((prevItem) =>
        prevItem.id !== id
          ? prevItem
          : {
              ...prevItem,
              [name]: value,
            },
      ),
    )
  }

  return (
    <>
      <div className="sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3">
        <div className="flex justify-between">
          <div className="divide-x ">
            <Link to="/" className="action-link !ps-0">
              Home
            </Link>
            <button onClick={() => window.history.back()} className="action-link px-1">
              Back
            </button>
          </div>

          <button
            className="action-link"
            onClick={addSupplierWithItems}
            disabled
          >
            Save
          </button>
        </div>
        <h2 className="text-2xl text-center mb-3 font-bold">Add Supplier</h2>

        <input
          type="text"
          className="form-control w-full mb-5"
          placeholder="Supplier's name"
          value={supplierName}
          onChange={(e) => setSupplierName(e.currentTarget.value)}
        />

        <ul className="space-y-1">
          {items.map((i, index) => (
            <SupplierItem
              key={i.id}
              data={i}
              index={index}
              expanded={expanded == i.id}
              setExpanded={handleExpand}
              formUpdate={handleFieldUpdate}
              removeCallback={removeItem}
            />
          ))}
          <li>
            <button
              className={`btn w-full mt-6`}
              onClick={() => setItems((prev) => [...prev, { id: Date.now() }])}
            >
              Add item
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}

const SupplierItem = ({
  data,
  index,
  expanded = false,
  setExpanded,
  formUpdate,
  removeCallback,
}) => {
  return (
    <li className="border">
      <div
        className={`${expanded && 'border-b bg-blue-400 !text-white font-bold'} p-2 flex gap-2`}
        onClick={() => setExpanded(data.id)}
      >
        Item {index + 1}
        <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
      </div>

      {expanded && (
        <div className="p-3 ">
          <form
            onChange={(e) => formUpdate(e, data.id)}
            className="flex flex-col space-y-1"
          >
            <textarea name="name" placeholder="Name" className="form-control" />
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
          </form>

          <button
            className="block ms-auto mt-3 action-link !text-red-500"
            onClick={(e) => removeCallback(data.id)}
          >
            Delete
          </button>
        </div>
      )}
    </li>
  )
}
