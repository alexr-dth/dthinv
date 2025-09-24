import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { addItemMutation, addSupplierMutation } from '@/api/api'

export const Route = createFileRoute('/suppliers/add')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [expanded, setExpanded] = useState(-1)
  const [items, setItems] = useState([])

  const { mutateAsync: createSupplier } = useMutation({
    mutationFn: addSupplierMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  })
  const { mutateAsync: createItems } = useMutation({
    mutationFn: addItemMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })

  const handleExpand = (id) => setExpanded(id == expanded ? -1 : id)
  const handleRemoveItem = (id) =>
    setItems((prev) => prev.filter((p) => p.id != id))
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

  const handleAddSupplierWithItems = async (e) => {
    e.preventDefault()
    const form = e.target
    const btn = e.nativeEvent.submitter
    btn.disabled = true
    try {
      const { id: supplierId } = await createSupplier({
        name: form.elements['name']?.value,
        barcode_qr: form.elements['barcode_qr']?.value,
      })

      if (!items.length) return navigate({ to: '/items' })
      try {
        const newItems = items
          .filter(({ name }) => !!name)
          .map((i) => ({
            id: undefined,
            supplier_id: supplierId,
            short_name: i['name'],
            sku_number: i['external_sku'],
            internet_sku_number: i['internal_sku'],
            item_desc: i['desc'],
            item_price: parseFloat(i['price']),
            item_image: i['image'],
            order_threshold: i['threshold'],
          }))

        if (newItems.length) {
          await createItems(newItems)
        }
        navigate({ to: '/items' })
        toast.success('Added supplier and items')
      } catch (error) {
        console.log(error)
        toast.error('Error adding items')
      }
    } catch (error) {
      console.log(error)
      toast.error('Process failed')
    } finally {
      btn.disabled = false
    }
  }

  return (
    <>
      <div className="page-container">
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

          <button
            type="submit"
            className="action-link"
            form="new-supplier-form"
          >
            Save
          </button>
        </div>
        <h2 className="page-title">Add Supplier</h2>

        <form
          onSubmit={handleAddSupplierWithItems}
          id="new-supplier-form"
          method="post"
          className="space-y-1 mb-5"
        >
          <input
            type="text"
            name="name"
            className="form-control w-full"
            placeholder="Supplier's name"
            required
          />

          <input
            type="text"
            name="barcode_qr"
            className="form-control w-full"
            placeholder="QR Code"
            required
          />
        </form>

        <ul className="space-y-1">
          {items.map((i, index) => (
            <NewSupplierItem
              key={i.id}
              data={i}
              index={index}
              expanded={expanded == i.id}
              setExpanded={handleExpand}
              formUpdate={handleFieldUpdate}
              removeCallback={handleRemoveItem}
            />
          ))}
          <li>
            <button
              className={`action-link w-full mt-6 underline`}
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

const NewSupplierItem = ({
  data,
  index,
  expanded = false,
  setExpanded,
  formUpdate,
  removeCallback,
}) => {
  const nameRef = useRef(null)

  return (
    <li className="border cursor-pointer">
      <div
        className={`${expanded && 'border-b bg-blue-400 !text-white font-bold'} p-2 flex items-center gap-2`}
        onClick={() => setExpanded(data.id)}
      >
        <span>Item {index + 1}</span>
        <span
          className={`${expanded && '!text-white'} ${nameRef.current && nameRef.current.value && `hidden`} text-gray-500 text-xs`}
        >
          (name required)
        </span>
        <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
      </div>

      <div className={`${!expanded && 'hidden'} p-3`}>
        <form
          onChange={(e) => formUpdate(e, data.id)}
          className="flex flex-col space-y-1"
        >
          <select name="image" className="form-control">
            <option value="/warehouse.jpg">Warehouse (testing)</option>
            <option value="/pliers.jpg">Pliers (testing)</option>
            <option value="/wrench.jpg">Wrench (testing)</option>
            <option value="/drill.jpg">Drill (testing)</option>
          </select>

          <input
            name="name"
            type="text"
            placeholder="*Name"
            className="form-control required"
            ref={nameRef}
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
            placeholder="Threshold"
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
    </li>
  )
}
