import { fetchItems } from '@/api/api'
import PageLoader from '@/components/PageLoader'
import ItemSearchBarWithFilters from '@/components/ItemSearchBarWithFilters'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { LucideListFilter, LucideMinus, LucidePlus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/orders/new2')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showingProducts, showProducts] = useState(true)
  const [cartList, setCardList] = useState([])
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

  const handleAddCartItem = async (e, item) => {
    e.preventDefault()
    const form = e.target
    const newOrder = {
      ...item,
      requested_qty: form.elements['qty']?.value || 0,
      approved_qty: 0,
    }
    const existInCart = cartList.some(({ id }) => id == item.id)
    if (existInCart) {
      setCardList((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                requested_qty:
                  parseInt(i.requested_qty) + parseInt(newOrder.requested_qty),
              }
            : i,
        ),
      )
    } else {
      setCardList((prev) => [...prev, newOrder])
    }

    closeModal()
    toast.success('Product added')
  }

  const handleEditCartItem = async (e, item) => {
    e.preventDefault()
    const form = e.target
    const addition = parseInt(form.elements['qty']?.value) || 0
    setCardList((prev) =>
      prev.map((p) =>
        p.id == item.id
          ? { ...p, requested_qty: parseInt(p.requested_qty) + addition }
          : p,
      ),
    )

    closeModal()
    toast.success('Product edited')
  }

  const totalPrice = (items = []) =>
    items.reduce(
      (sum, { price = 0, requested_qty }) =>
        sum + price * parseInt(requested_qty),
      0,
    )

  const totalUnits = (items = []) =>
    items.reduce((sum, { requested_qty }) => sum + parseInt(requested_qty), 0)

  const handleRemoveCartItem = (id) => {
    if (!confirm('Remove item?')) return
    setCardList((prev) => prev.filter((i) => i.id != id))
    toast.success('Product removed')
  }

  const handleSubmitOrder = (e) => {
    e.preventDefault()
    toast.success('Order is placed')
    // navigate({ to: '/orders' })
  }

  if (isLoading) return <PageLoader />
  if (error) return <p>Error: {error.message}</p>
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg">
            {activeModal.name == 'addOrder' && (
              <AddOrderModal
                cancelCallback={closeModal}
                saveCallback={handleAddCartItem}
                data={activeModal.data}
              />
            )}

            {activeModal.name == 'editOrder' && (
              <EditOrderModal
                cancelCallback={closeModal}
                saveCallback={handleEditCartItem}
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

          <button className="action-link" form="order-form">
            Save
          </button>
        </div>
        <h2 className="page-title">Create Order</h2>

        <form id="order-form" method="post" onSubmit={handleSubmitOrder}>
          <div className="flex flex-col space-y-1">
            <span className="text-xs">Requester Name</span>
            <input
              name="requester_name"
              type="text"
              value={'Alex Ramos'}
              className="w-full border rounded p-2 disabled:bg-gray-200 text-gray-500"
              disabled
            />

            <input
              name="name"
              type="text"
              placeholder="Order name"
              className="w-full border rounded p-2"
              required
            />

            <textarea
              name="requester_notes"
              placeholder="Notes"
              className="w-full border rounded p-2"
            />
          </div>
        </form>

        <div className="divide-x mt-6 mb-2 text-nowrap overflow-auto pb-2">
          <button
            className="action-link"
            onClick={() => showProducts(true)}
            aria-selected={showingProducts}
          >
            Products
          </button>
          <button
            className="action-link"
            onClick={() => showProducts(false)}
            aria-selected={!showingProducts}
          >
            Order list
          </button>
        </div>

        {showingProducts ? (
          <>
            <h3 className="font-semibold text-lg text-center mb-3">
              Search Products
            </h3>

            <ItemSearchBarWithFilters />

            <div className="grid grid-cols-2 gap-3 ">
              {data?.map((item) => (
                <ProductGridCard
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

            <ItemSearchBarWithFilters />

            <div className="flex flex-col gap-3 ">
              {cartList?.map((item) => (
                <ItemInCartCard
                  key={item.id}
                  data={item}
                  actionCallback={handleRemoveCartItem}
                  setActiveModal={setActiveModal}
                />
              ))}
            </div>

            <div className="border-t-8 text-end mt-5 pt-2 mb-10">
              <div className="bg-blue-100 p-2 rounded shadow">
                <div className="text-sm py-2 justify-between flex items-center">
                  <span>
                    Total ({cartList.length || 0} types/
                    {totalUnits(cartList)} units):{' '}
                  </span>
                  <span className="font-bold text-3xl">
                    ${totalPrice(cartList).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

const ProductGridCard = ({ data, setActiveModal }) => {
  return (
    <div className="rounded border p-2 h-full flex flex-col">
      {/* CONTENT */}
      <div className="flex flex-col">
        <img
          src={data?.item_image || 'missing.jpg'}
          alt=""
          className="w-full aspect-square object-cover mb-2"
        />
        <div className="text-xs text-gray-600 font-semibold mb-1 truncate">
          {data.supplier?.name || 'n/a'}
        </div>

        <div className="text-lg leading-5 line-clamp-2 flex-grow-1 flex-shrink-0">
          {data.name || 'n/a'}
        </div>

        <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
          {data.external_sku || 'n/a'}
        </div>

        <div className="text-xs text-gray-400 truncate">
          {data?.internal_sku || 'n/a'}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2/5 me-auto text-nowrap font-medium text-sm truncate">
            <span className="font-semibold">Stk:</span>{" "}
            <span className="">{data.stocks || 0}</span>
          </div>

          <div className="w-3/5 text-2xl font-bold text-gray-800 truncate text-end">
            ${data.price?.toFixed(2) || 'n/a'}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end">
        <button
          className="action-link text-end text-sm"
          onClick={() => setActiveModal({ name: 'addOrder', data: data })}
        >
          Add order
        </button>
      </div>
    </div>
  )
}

const ItemInCartCard = ({ data: item, setActiveModal, actionCallback }) => {
  return (
    <div className="rounded border p-2 h-full flex gap-2">
      <div></div>
      <img
        src={item?.item_image || 'missing.jpg'}
        alt=""
        className="w-1/4 object-contain"
      />

      <div className="w-3/4 flex flex-col">
        <div className="text-xs text-gray-600 font-semibold truncate">
          {item.supplier?.name || 'n/a'}
        </div>

        <div className="text-lg leading-5 line-clamp-2  flex-grow-1 flex-shrink-0">
          {item.name || 'n/a'}
        </div>

        <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
          {item.external_sku || 'n/a'}
        </div>

        <div className="text-xs text-gray-400 truncate">
          {item.internal_sku || 'n/a'}
        </div>

        <div className="flex items-center gap-2 truncate">
          <button
            className="me-auto text-nowrap font-medium truncate action-link underline"
            onClick={() => setActiveModal({ name: 'editOrder', data: item })}
          >
            <span className="font-semibold">Qty:</span>{" "}
            <span className="">
              {item.requested_qty || 'n/a'} <span className=''>pcs</span>
            </span>
          </button>

          <div className="ms-auto text-xl font-bold text-gray-800 truncate">
            $
            {(parseInt(item.requested_qty) * parseFloat(item.price)).toFixed(
              2,
            ) || 'n/a'}
          </div>
        </div>

        <button
          className="action-link text-sm self-end !text-red-500"
          onClick={() => actionCallback(item.id)}
        >
          Remove order
        </button>
      </div>
    </div>
  )
}

const AddOrderModal = ({ data, saveCallback, cancelCallback }) => {
  const [qty, setQty] = useState(1)
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

        <div className="my-4 justify-center flex gap-4 text-lg font-semibold">
          <button
            type="button"
            className="action-link"
            onClick={() => addQty(10)}
          >
            +10
          </button>
          <button
            type="button"
            className="action-link"
            onClick={() => addQty(100)}
          >
            +100
          </button>
          <button
            type="button"
            className="action-link"
            onClick={() => addQty(1000)}
          >
            +1000
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

          <div className="space-x-1 text-nowrap">
            <input
              type="number"
              className="form-control text-end"
              name="qty"
              min={1}
              placeholder="100"
              value={qty}
              required
              onChange={(e) => setQty(parseInt(e.target.value))}
            />
            <span className="text-gray-400">pcs</span>
          </div>

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

const EditOrderModal = ({ data, saveCallback, cancelCallback }) => {
  const [qty, setQty] = useState(data.requested_qty)
  const addQty = (num) => {
    setQty((prev) => prev + num)
  }

  return (
    <div className="bg-white rounded p-3 mx-3">
      <form onSubmit={(e) => saveCallback(e, data)} method="post">
        <h3 className="font-semibold  mb-3 text-xl">Edit order</h3>
        <div className="space-x-1">
          <span className="text-gray-400 text-sm">Ordering</span>
          <span className="font-semibold">{data.name}</span>
        </div>

        <div className="my-4 justify-center flex gap-4 text-lg font-semibold">
          <button
            type="button"
            className="action-link"
            onClick={() => addQty(10)}
          >
            +10
          </button>
          <button
            type="button"
            className="action-link"
            onClick={() => addQty(100)}
          >
            +100
          </button>
          <button
            type="button"
            className="action-link"
            onClick={() => addQty(1000)}
          >
            +1000
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

          <div className="space-x-1 text-nowrap">
            <input
              type="number"
              className="form-control text-end"
              name="qty"
              min={1}
              placeholder="100"
              value={qty}
              required
              onChange={(e) => setQty(parseInt(e.target.value))}
            />
            <span className="text-gray-400">pcs</span>
          </div>

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
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
