import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import usePaginatedQuery from '@/hooks/usePaginatedQuery'
import { fetchPaginatedRequests } from '@/api/api'
import PendingRequestedCard from '@/components/Cards/PendingRequestedCard'
import EmptyList from '@/components/EmptyList'

const groupDataArr = (data = []) => {
  return data.reduce((acc, row) => {
    // Jan 1, 2001
    const dateLabel = new Date(row.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    // {label: "Jan 1, 2001" }
    let dateObj = acc.find((d) => d['label'] === dateLabel)
    if (!dateObj) {
      dateObj = { label: dateLabel, suppliers: [] }
      acc.push(dateObj)
    }
    const supplier = row.item?.supplier || {}
    let supplierObj = dateObj.suppliers.find((s) => s.name === supplier.name)
    if (!supplierObj) {
      // {name: "Supplier Name", barcode_qr: "abcxyz", requested_items: []}
      supplierObj = { ...supplier, requested_items: [] }

      // {label: "Jan 1, 2001", supplier: [{..., requested_items: []}]  }
      dateObj.suppliers.push(supplierObj)
    }
    // Push item
    supplierObj.requested_items.push(row)
    return acc
  }, [])
}

export const Route = createFileRoute('/requests/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const [filteredData, setFilteredData] = useState([])
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const {
    data = {},
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    error,
    dataUpdatedAt,
  } = usePaginatedQuery({
    queryKey: ['requested-items', 'paginated'],
    queryFn: fetchPaginatedRequests,
  })

  const itemsData = groupDataArr(data?.items ?? [])
  const totalCount = data?.totalCount ?? 0

  // useEffect(() => {
  //   setFilteredData(itemsData)
  // }, [dataUpdatedAt])

  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">{/* modal*/}</div>
        </div>
      )}

      <div className="page-container">
        <div className="flex justify-between">
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
          <Link to="/request" className="action-link">
            Request
          </Link>
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

        <EmptyList
          iterable={itemsData}
          nonEmpty={
            <div className="space-y-8">
              {itemsData.map((group, index) => (
                <div key={index}>
                  <TitleDivider title={group.label} />
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
          }
        />

        <div className="mt-5 text-center mb-5">
          <div className="text-xs mb-4 font-light text-gray-400">
            Showing {itemsData?.length} of {totalCount} items
          </div>
          {hasNextPage && (
            <button
              className="action-link"
              disabled={isFetching}
              onClick={() => fetchNextPage()}
            >
              Load More...
            </button>
          )}
        </div>
      </div>
    </>
  )
}

const SupplierProductSetWithActions = ({ supplier, requestedItems }) => {
  const navigate = useNavigate({ from: '/' })

  const [expanded, setExpanded] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const handleProceedNewOrder = () => {
    if (!selectedIds?.length || !Array.isArray(selectedIds))
      return alert('No items selected')
    navigate({
      to: '/orders/new',
      state: { selectedIds, supplier },
    })
  }

  return (
    <div className="border rounded">
      <h3
        className={` p-2 flex items-center gap-1 ${expanded && 'border-b-1'} cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h5 className="text-lg font-semibold uppercase">{supplier.name}</h5>
          {!expanded && (
            <span className="text-xs text-gray-500">
              ({requestedItems?.length || 0} item/s)
            </span>
          )}
        </div>

        <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
      </h3>

      {expanded && (
        <div className="px-2 pb-2">
          <ul className="space-y-2 divide-y divide-gray-400 pb-2">
            {(requestedItems || []).map((reqItem) =>
              reqItem.request_status === 'processing' ? (
                <ProcessingRequestedCard data={reqItem} key={reqItem.id} />
              ) : reqItem.request_status === 'complete' ? (
                <CompleteRequestedCard data={reqItem} key={reqItem.id} />
              ) : reqItem.request_status === 'denied' ? (
                <DeniedRequestedCard data={reqItem} key={reqItem.id} />
              ) : (
                <PendingRequestedCard
                  key={reqItem.id}
                  data={reqItem}
                  selected={selectedIds.includes(reqItem.id)}
                  setSelectedIds={setSelectedIds}
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
                  setSelectedIds([])
                }}
              >
                Select none
              </button>
              <button
                className="action-link text-xs"
                onClick={() => {
                  setSelectedIds(() => {
                    return requestedItems.map((item) => item.id)
                  })
                }}
              >
                Select all
              </button>
              <button
                className="action-link !text-lg font-bold ms-auto"
                onClick={handleProceedNewOrder}
                disabled={!selectedIds?.length || false}
              >
                Proceed→
              </button>
            </div>
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
    <div className="mt-2   border-amber-400 border-s-5 rounded-s-md">
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
        className="text-xs  !text-gray-400 mx-auto block  px-5 py-1"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 px-2">
          {data.order_id && (
            <div>
              <span className="font-bold">Order Id: </span>{' '}
              <Link
                to="/orders/$orderId"
                params={{ orderId: data.order_id }}
                className="action-link underline"
              >
                {data.order_id}
              </Link>
            </div>
          )}

          <div>
            <span className="font-bold">Requested by: </span>
            {data.type === 'system'
              ? 'SYSTEM'
              : (data.requester?.username ?? 'n/a')}
          </div>
          {data.evaluator_id && (
            <div>
              <span className="font-bold">Evaluated by: </span>
              {data.evaluator?.username ?? 'n/a'}
            </div>
          )}

          <div>
            <span className="font-bold">Description: </span>
            {item.item_desc}
          </div>
          <div>
            <span className="font-bold">Notes: </span> {data.notes || 'n/a'}
          </div>
        </div>
      )}
    </div>
  )
}

const CompleteRequestedCard = ({ data }) => {
  const [expanded, setExpanded] = useState(false)
  const item = data.item

  return (
    <div className="mt-2 opacity-60   border-green-600 border-s-5 rounded-s-md">
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
        className="text-xs  !text-gray-400 mx-auto block  px-5 py-1"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 px-2">
          {data.order_id && (
            <div>
              <span className="font-bold">Order Id: </span>{' '}
              <Link
                to="/orders/$orderId"
                params={{ orderId: data.order_id }}
                className="action-link underline"
              >
                {data.order_id}
              </Link>
            </div>
          )}

          <div>
            <span className="font-bold">Requested by: </span>
            {data.type === 'system'
              ? 'SYSTEM'
              : (data.requester?.username ?? 'n/a')}
          </div>
          {data.evaluator_id && (
            <div>
              <span className="font-bold">Evaluated by: </span>
              {data.evaluator?.username ?? 'n/a'}
            </div>
          )}

          <div>
            <span className="font-bold">Description: </span>
            {item.item_desc}
          </div>
          <div>
            <span className="font-bold">Notes: </span> {data.notes || 'n/a'}
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
    <div className="mt-2 opacity-60   border-gray-400 border-s-5 rounded-s-md">
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
        className="text-xs  !text-gray-400 mx-auto block  px-5 py-1"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button>

      {expanded && (
        <div className="text-xs leading-4 text-gray-500 mb-4 px-2">
          {data.order_id && (
            <div>
              <span className="font-bold">Order Id: </span>{' '}
              <Link
                to="/orders/$orderId"
                params={{ orderId: data.order_id }}
                className="action-link underline"
              >
                {data.order_id}
              </Link>
            </div>
          )}

          <div>
            <span className="font-bold">Requested by: </span>
            {data.type === 'system'
              ? 'SYSTEM'
              : (data.requester?.username ?? 'n/a')}
          </div>
          {data.evaluator_id && (
            <div>
              <span className="font-bold">Evaluated by: </span>
              {data.evaluator?.username ?? 'n/a'}
            </div>
          )}

          <div>
            <span className="font-bold">Description: </span>
            {item.item_desc}
          </div>
          <div>
            <span className="font-bold">Notes: </span> {data.notes || 'n/a'}
          </div>
        </div>
      )}
    </div>
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
