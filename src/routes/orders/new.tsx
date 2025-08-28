import { fetchItems } from '@/api/api'
import ProductSearchBarWithFilters from '@/components/ProductSearchBarWithFilters'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { LucideListFilter, LucideMinus, LucidePlus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/orders/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showingProducts, showProducts] = useState(true)
  const [orderList, setOrderList] = useState([])
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const navigate = useNavigate()

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  })

  const closeModal = () => setActiveModal(null)

  const addOrderItem = async (e, item) => {
    e.preventDefault()
    const form = e.target
    const newOrder = {
      ...item,
      quantity: form.elements['qty']?.value || '0',
      total_price: form.elements['total_price']?.value || '0',
    }
    setOrderList((prev) => [...prev, newOrder])
    closeModal()
    toast.success('Product added')
  }

  const submitOrder = (e) => {
    e.preventDefault()
    toast.success('Order is placed')
    navigate({ to: '/orders' })
  }

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg">
            {activeModal.name == 'addOrder' && (
              <AddOrderModal
                cancelCallback={closeModal}
                saveCallback={addOrderItem}
                data={activeModal.data}
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

          <button className="action-link" onClick={submitOrder}>
            Save
          </button>
        </div>
        <h2 className="text-2xl text-center mb-3 font-bold">Create Order</h2>

        <form method="post">
          <div className="flex flex-col space-y-1">
            <span className="mb-0 text-xs">*Requester Name</span>
            <input
              name="requester_name"
              type="text"
              value={'Alex Ramos'}
              className="w-full border rounded p-2 disabled:bg-gray-200 text-gray-500"
              disabled
            />

            <input
              name="order_name"
              type="text"
              placeholder="Order name"
              className="w-full border rounded p-2"
            />

            <textarea
              name="notes"
              placeholder="Notes"
              className="w-full border rounded p-2"
            />
          </div>
        </form>

        <div className="divide-x mt-6 mb-2 text-nowrap overflow-auto pb-2">
          <button className="action-link" onClick={() => showProducts(true)}>
            Products
          </button>
          <button className="action-link" onClick={() => showProducts(false)}>
            Order list
          </button>
        </div>

        {showingProducts ? (
          <>
            <h3 className="font-semibold text-lg text-center mb-3">
              Search Products
            </h3>

            <ProductSearchBarWithFilters />

            <div className="grid grid-cols-2 gap-3 ">
              {data?.map((item) => (
                <ItemCard
                  key={item.id}
                  data={item}
                  setActiveModal={setActiveModal}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-lg text-center mb-3">Cart</h3>

            <div className="flex items-center gap-1 mb-3">
              <input
                type="text"
                className="form-control flex-1"
                placeholder="Search"
              />
              <div className="">
                <LucideListFilter
                  size={42}
                  className="bg-white p-0.5 rounded border cursor-pointer text-black shadow"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 ">
              {orderList?.map((item) => (
                <OrderCard
                  key={item.id}
                  data={item}
                  setActiveModal={setActiveModal}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

const ItemCard = ({ data, setActiveModal }) => {
  return (
    <div className="rounded border p-2 h-full flex flex-col">
      <img
        src="/warehouse.jpg"
        alt=""
        className="w-full aspect-square object-cover mb-2"
      />
      <div className="text-xs text-gray-600 font-semibold mb-1 truncate">
        {data?.vendor}
      </div>

      <div className="text-lg leading-5 line-clamp-2 mb-3 flex-grow-1 flex-shrink-0">
        {data?.name}
      </div>

      <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
        {data?.sku}
      </div>

      <div className="text-xs text-gray-400 truncate">{data?.internal_sku}</div>

      <div className="flex items-center gap-2">
        <div className="me-auto text-nowrap font-medium truncate text-sm">
          <span className="font-semibold">Stck:</span>{' '}
          <span className="">{data?.stock}</span>
        </div>

        <div className="text-2xl font-bold text-gray-800 truncate ">
          ${data?.price}
        </div>
      </div>

      <button
        className="action-link text-end"
        onClick={() => setActiveModal({ name: 'addOrder', data: data })}
      >
        Add order
      </button>
    </div>
  )
}

const OrderCard = ({ data, setActiveModal }) => {
  return (
    <div className="rounded border p-2 h-full flex gap-2">
      <img src="/warehouse.jpg" alt="" className="max-w-1/4 object-contain" />

      <div className="w-3/4 flex flex-col">
        <div className="text-xs text-gray-600 font-semibold truncate">
          {data?.vendor}
        </div>

        <div className="text-lg leading-5 line-clamp-2  flex-grow-1 flex-shrink-0">
          {data?.name}
        </div>

        <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
          {data?.sku}
        </div>

        <div className="text-xs text-gray-400 truncate">
          {data?.internal_sku}
        </div>

        <div className="flex items-center gap-2 truncate">
          <div className="me-auto text-nowrap font-medium truncate text-sm">
            <span className="font-semibold">Qty:</span>{' '}
            <span className="">{data?.quantity}</span>
          </div>

          <div className="ms-auto text-2xl font-bold text-gray-800 truncate">
            ${parseInt(data?.total_price).toFixed(2)}
          </div>
        </div>

        <button
          className="action-link self-end !text-red-500"
          onClick={() => setActiveModal({ name: 'addOrder', data: data })}
        >
          Remove order
        </button>
      </div>
    </div>
  )
}

const AddOrderModal = ({ data, saveCallback, cancelCallback }) => {
  const [qty, setQty] = useState(0)
  const addQty = (num) => {
    setQty((prev) => prev + num)
  }

  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={(e) => saveCallback(e, data)} method="post">
        <h3 className="font-semibold  mb-3 text-xl">Add order</h3>
        <div className="space-x-1">
          <span className="text-gray-400 text-sm">Ordering</span>
          <span className="font-semibold">{data.name}</span>
        </div>

        <div className="my-4 grid grid-cols-5 gap-1">
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(10)}
          >
            10
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(20)}
          >
            20
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(30)}
          >
            30
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(40)}
          >
            40
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(50)}
          >
            50
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(60)}
          >
            60
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(70)}
          >
            70
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(80)}
          >
            80
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(90)}
          >
            90
          </button>
          <button
            type="button"
            className="action-link underline"
            onClick={() => addQty(100)}
          >
            100
          </button>
        </div>

        <div className="flex gap-1">
          <button
            className="action-link flex-1"
            type="button"
            onClick={() => addQty(-1)}
          >
            <LucideMinus className="mx-auto" />
          </button>
          <input
            type="number"
            className="form-control text-end"
            name="qty"
            min={1}
            placeholder="100"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value))}
          />

          <input
            type="hidden"
            name="total_price"
            value={qty * (data.price || 0)}
          />
          <button
            className="action-link flex-1"
            type="button"
            onClick={() => addQty(1)}
          >
            <LucidePlus className="mx-auto" />
          </button>
        </div>

        <div className="mt-2 bg-gray-200 p-2 rounded shadow flex items-center justify-end gap-1">
          <span className="text-sm">Total:</span>
          <span className="font-bold text-xl truncate">
            ${(qty * (data.price || 0)).toFixed(2)}
          </span>
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
            Add
          </button>
        </div>
      </form>
    </div>
  )
}
