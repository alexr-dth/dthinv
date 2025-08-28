import { fetchItems } from '@/api/api'
import PageLoader from '@/components/PageLoader'
import ProductSearchBarWithFilters from '@/components/ProductSearchBarWithFilters'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/locations/$locationId/items')({
  component: RouteComponent,
})

function RouteComponent() {
  const { locationId } = useParams({ from: '/locations/$locationId/items' })

  const [rowView, setRowView] = useState(false)
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  // React Query - for fetching data via api
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['locations', String(locationId), 'items'],
    queryFn: fetchItems,
  })

  if (isLoading) return <PageLoader />
  if (error) return <p>Error: {error.message}</p>
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg"></div>
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
          Location Inventory
        </h2>

        <ProductSearchBarWithFilters />

        <button className="text-blue-500 mt-6 mb-2" onClick={() => setRowView(!rowView)}>Toggle view</button>

        {rowView ? (
          <div className="grid grid-cols-2 gap-3">
            {data?.map((item) => (
              <ItemCard
                key={item.id}
                data={item}
                setActiveModal={setActiveModal}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data?.map((item) => (
              <ItemRowCard
                key={item.id}
                data={item}
                setActiveModal={setActiveModal}
              />
            ))}
          </div>
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

      {/* Vendor / Store */}
      <div className="text-xs text-gray-600 font-semibold mb-1 truncate">
        {data?.vendor || 'undefined'}
      </div>

      {/* Product Name */}
      <div className="text-lg leading-5 line-clamp-2 mb-3 flex-grow-1 flex-shrink-0">
        {data?.name || 'undefined'}
      </div>

      {/* SKU / ID */}
      <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
        {data?.sku || 'SKU-MISSING'}
      </div>

      {/* Secondary ID */}
      <div className="text-xs text-gray-400 truncate">
        {data?.internal_sku || 'DTH-MISSING'}
      </div>

      <div className="text-sm flex items-center justify-between gap-2">
        <div className="text-nowrap font-medium truncate">
          <span className="font-semibold">Stock:</span>{' '}
          <span className="">{data?.stock}</span>
        </div>
      </div>
    </div>
  )
}

const ItemRowCard = ({ data, setActiveModal }) => {
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
            <span className="font-semibold">Stock:</span>{' '}
            <span className="">{data?.stock}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
