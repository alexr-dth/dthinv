import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchRequestsFormatted } from '@/api/api'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/requests/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const { data: requestedItems = [] } = useQuery({
    queryKey: ['requested-items'],
    queryFn: fetchRequestsFormatted,
    select: (fetched) => {
      // sort via date/label
      return fetched.sort((a, b) => new Date(b.label) - new Date(a.label))
    },
  })

  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {/* {activeModal.name == 'manualSearch' && (
              <ManualSearchModal
                confirmCallback={checkIfItemExist}
                cancelCallback={closeModal}
              />
            )} */}
          </div>
        </div>
      )}

      <div className="page-container">
        <div className="divide-x ">
          <Link to="/" className="action-link !ps-0">
            {t('Home')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="action-link px-1"
          >
            {t('Back')}
          </button>
        </div>

        <h2 className="page-title">Requested Items</h2>
        <div id="title-buttons" className="space-x-1 overflow-auto ">
          <button className="cursor-pointer text-sm px-2 rounded-full border">
            Home Depot
          </button>
          <button className="cursor-pointer text-sm px-2 rounded-full border">
            Hardware Resources
          </button>
          <button className="cursor-pointer text-sm px-2 rounded-full border">
            Amazon
          </button>
        </div>

        <div className="space-y-8">
          {requestedItems.map((group, index) => (
            <div>
              <TitleDivider title={group.label} key={index} />
              <div className="space-y-1">
                {(group.suppliers || []).map((set, index) => (
                  <SupplierProductSetWithActions
                    key={index}
                    supplier={set}
                    requestedItems={set.requested_items}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="action-link underline !text-gray-300 block mx-auto text-sm font-bold py-4">
          Load More...
        </button>
      </div>
    </>
  )
}

const TitleDivider = ({ title, mode = 'days' }) => {
  const formatDaysAgo = (input) => {
    const date = new Date(input)
    if (isNaN(date)) return input // fallback if not a valid date

    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 60) return 'a month ago'
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    if (diffDays < 730) return 'a year ago'

    return `${Math.floor(diffDays / 365)} years ago`
  }

  const displayText = mode === 'days' ? formatDaysAgo(title) : title

  return (
    <div className="mt-3 flex items-center flex-nowrap w-full text-blue-400">
      <div className="flex-grow border-t border-dashed"></div>
      <span className="mx-4">{displayText}</span>
      <div className="flex-grow border-t border-dashed"></div>
    </div>
  )
}

const SupplierProductSetWithActions = ({ supplier, requestedItems }) => {
  const navigate = useNavigate()

  const [expanded, setExpanded] = useState(false)
  const [selectedAll, selectAll] = useState(false)

  const [checkedArr, setCheckedArr] = useState([])

  const handleProceedNewOrder = () => {
    if (!checkedArr.length) return alert('No items selected')
    navigate({
      to: '/orders/new',
      state: { checkedArrIds: checkedArr, supplier },
    })
  }

  return (
    <div className="border rounded cursor-pointer">
      <h3
        className={` p-2 flex items-center gap-1 ${expanded && 'border-b-1'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h5 className="text-lg font-semibold uppercase">{supplier.name}</h5>
          {!expanded && (
            <span className="text-xs text-gray-500">
              ({requestedItems.length || 0} item/s)
            </span>
          )}
        </div>

        <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
      </h3>

      {expanded && (
        <div className="px-2 pb-2">
          <ul className="space-y-2 divide-y divide-gray-400 pb-2">
            {(requestedItems || []).map((item) =>
              item.request_status === 'processing' ? (
                <ProcessingRequestedCard data={item} key={item.id} />
              ) : item.request_status === 'complete' ? (
                <CompletedRequestedCard data={item} key={item.id} />
              ) : item.request_status === 'denied' ? (
                <DeniedRequestedCard data={item} key={item.id} />
              ) : (
                <RequestedItemCard
                  data={item}
                  key={item.id}
                  selected={checkedArr.includes(item.id)}
                  setCheckedArr={setCheckedArr}
                />
              ),
            )}

            {/* <CompletedRequestedCard data={sampleItem} /> */}
          </ul>

          <div className="text-end text-sm py-2 bg-gray-200 p-2 rounded shadow">
            {/* <div className="text-sm">
              Total (2 types/10 units):{' '}
              <span className="font-bold text-xl">$5000</span>
            </div> */}

            <div className="flex">
              <button
                className="action-link text-xs"
                onClick={() => {
                  selectAll(false)
                  setCheckedArr([])
                }}
              >
                Select none
              </button>
              <button
                className="action-link text-xs"
                onClick={() => {
                  selectAll(true)
                  setCheckedArr(() => {
                    return requestedItems.map((item) => item.id)
                  })
                }}
              >
                Select all
              </button>
              {/* <button className="action-link !text-lg font-bold ms-auto">
                  Proceed→
                </button> */}
              <button
                className="action-link !text-lg font-bold ms-auto"
                onClick={handleProceedNewOrder}
              >
                Proceed→
              </button>
            </div>
          </div>

          {/* <div className="py-2 text-center">No items added</div> */}
        </div>
      )}
    </div>
  )
}

const RequestedItemCard = ({ data, selected: checked, setCheckedArr }) => {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const item = data.item
  return (
    <div className="mt-2">
      <div className="flex items-stretch gap-2 mb-1">
        <label className="w-1/4 self-center" htmlFor={id}>
          <img
            src={item.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </label>
        <label className="w-3/4 flex flex-col" htmlFor={id}>
          <div className="font-bold text-xs text-gray-400 uppercase">
            {data.type || 'n/a'}
          </div>
          <div className="text-lg leading-5 line-clamp-2 flex-grow-1 flex-shrink-0">
            {item.short_name || 'n/a'}
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
                {item.sku_number || 'n/a'}
              </div>

              <div className="text-xs text-gray-400 truncate">
                {item?.internet_sku_number || 'n/a'}
              </div>

              <div className="text-nowrap font-bold text-sm">
                <span>Onhand:</span> {item.inventory || 0}
              </div>
            </div>

            <div className="flex-1 font-bold text-end">
              ${parseFloat(item.item_price || 0).toFixed(2)}
            </div>
          </div>
        </label>
        <div className="self-center px-1">
          <input
            type="checkbox"
            className="h-5 aspect-square"
            id={id}
            checked={checked}
            onChange={(e) => {
              setCheckedArr((prev) => {
                return !checked
                  ? [...prev, data.id] // add
                  : prev.filter((i) => i != data.id) // subtract
              })
            }}
          />
        </div>
      </div>

      <button
        className="text-xs  !text-gray-400 mx-auto block"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 space-y-2 px-2">
          <div>
            <span className="font-bold">Description: </span>
            1-1/4 in. x 1-1/2 in. x 10 ft. Galvanized Steel Drip Edge Flashing
          </div>
          <div>
            <span className="font-bold">Notes: </span> n/a
          </div>
        </div>
      )}
    </div>
  )
}

const ProcessingRequestedCard = ({ data }) => {
  const [expanded, setExpanded] = useState(false)
  const item = data.item

  return (
    <div className="mt-2   border-amber-400 border-s-5 rounded-tl-md rounded-bl-md">
      <div className="flex items-stretch gap-2 mb-1">
        <div className="w-1/4 self-center">
          <img
            src={item.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="text-sm line-clamp-2 flex-grow-1 flex-shrink-0">
            {item.short_name || 'n/a'}
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
                {item.sku_number || 'n/a'}
              </div>

              <div className="text-xs text-gray-400 truncate">
                {item?.internet_sku_number || 'n/a'}
              </div>

              <div className="text-nowrap font-bold tracking-widest text-sm text-amber-600">
                PROCESSING
              </div>
            </div>

            <div className="text-xs flex-1 text-end">
              ${parseFloat(item.item_price || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <button
        className="text-xs  !text-gray-400 mx-auto block"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 space-y-2 px-2">
          <div>
            <span className="font-bold">Description: </span>
            1-1/4 in. x 1-1/2 in. x 10 ft. Galvanized Steel Drip Edge Flashing
          </div>
          <div>
            <span className="font-bold">Notes: </span> n/a
          </div>
        </div>
      )}
    </div>
  )
}

const CompletedRequestedCard = ({ data }) => {
  const [expanded, setExpanded] = useState(false)
  const item = data.item

  return (
    <div className="mt-2 opacity-60   border-green-600 border-s-5 rounded-tl-md rounded-bl-md">
      <div className="flex items-stretch gap-2 mb-1">
        <div className="w-1/4 self-center">
          <img
            src={item.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="text-sm line-clamp-2 flex-grow-1 flex-shrink-0">
            {item.short_name || 'n/a'}
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
                {item.sku_number || 'n/a'}
              </div>

              <div className="text-xs text-gray-400 truncate">
                {item?.internet_sku_number || 'n/a'}
              </div>

              <div className="text-nowrap font-bold tracking-widest text-sm text-green-600">
                COMPLETED
              </div>
            </div>

            <div className="text-xs flex-1 text-end">
              ${parseFloat(item.item_price || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <button
        className="text-xs  !text-gray-400 mx-auto block"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 space-y-2 px-2">
          <div>
            <span className="font-bold">Description: </span>
            1-1/4 in. x 1-1/2 in. x 10 ft. Galvanized Steel Drip Edge Flashing
          </div>
          <div>
            <span className="font-bold">Notes: </span> n/a
          </div>
        </div>
      )}
    </div>
  )
}

const DeniedRequestedCard = ({ data }) => {
  const [expanded, setExpanded] = useState(false)
  const item = data.item

  return (
    <div className="mt-2 opacity-60   border-gray-400 border-s-5 rounded-tl-md rounded-bl-md">
      <div className="flex items-stretch gap-2 mb-1">
        <div className="w-1/4 self-center">
          <img
            src={item.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="text-sm line-clamp-2 flex-grow-1 flex-shrink-0">
            {item.short_name || 'n/a'}
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
                {item.sku_number || 'n/a'}
              </div>

              <div className="text-xs text-gray-400 truncate">
                {item?.internet_sku_number || 'n/a'}
              </div>

              <div className="text-nowrap font-bold tracking-widest text-sm text-gray-600">
                DENIED
              </div>
            </div>

            <div className="text-xs flex-1 text-end">
              ${parseFloat(item.item_price || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <button
        className="text-xs  !text-gray-400 mx-auto block"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 space-y-2 px-2">
          <div>
            <span className="font-bold">Description: </span>
            1-1/4 in. x 1-1/2 in. x 10 ft. Galvanized Steel Drip Edge Flashing
          </div>
          <div>
            <span className="font-bold">Notes: </span> n/a
          </div>
        </div>
      )}
    </div>
  )
}
