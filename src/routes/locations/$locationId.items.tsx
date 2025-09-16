import { fetchItems, fetchLocationById } from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import ItemSearchBarWithFilters from '@/components/ItemSearchBarWithFilters'
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
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['locations', String(locationId)],
    queryFn: () => fetchLocationById(locationId),
    select: (data) => data.items || [],
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg"></div>
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
          {/* <button className="action-link">
            Save
          </button> */}
        </div>
        <h2 className="page-title">
          Location Inventory
        </h2>

        <ItemSearchBarWithFilters />

        <div
          id="title-buttons"
          className="divide-x mt-6 mb-2 text-nowrap overflow-auto pb-2"
        >
          <button className="action-link" onClick={() => setRowView(!rowView)}>
            Toggle view
          </button>
        </div>

        {rowView ? (
          <div className="grid grid-cols-2 gap-3">
            {items?.map((item) => (
              <ItemCard
                key={item.id}
                data={item}
                setActiveModal={setActiveModal}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items?.map((item) => (
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
        src={data?.item_image || 'missing.jpg'}
        alt=""
        className="w-full aspect-square object-cover mb-2"
      />

      <div className="text-xs text-gray-600 font-semibold mb-1 truncate">
        {data.supplier?.name || 'n/a'}
      </div>

      <div className="text-lg leading-5 line-clamp-2 pb-0.5 flex-grow-1 flex-shrink-0">
        {data?.name || 'n/a'}
      </div>

      <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
        {data?.external_sku || 'n/a'}
      </div>

      <div className="text-xs text-gray-400 truncate">
        {data?.internal_sku || 'n/a'}
      </div>

      <div className="text-sm flex items-center justify-between gap-2">
        <div className="text-nowrap font-medium truncate">
          <span className="font-semibold">Loc Stk:</span>{' '}
          <span className="">{data?.location_stocks}</span>
        </div>
        <div className="text-nowrap font-medium truncate">
          <span className="font-semibold">Total Stk:</span>{' '}
          <span className="">{data?.total_stocks}</span>
        </div>
      </div>
    </div>
  )
}

const ItemRowCard = ({ data, setActiveModal }) => {
  return (
    <div className="rounded border p-2 h-full flex gap-2">
      <img
        src={data?.item_image || 'missing.jpg'}
        alt=""
        className="w-1/4 object-contain"
      />

      <div className="w-3/4 flex flex-col">
        <div className="text-xs text-gray-600 font-semibold truncate">
          {data.supplier?.name || 'n/a'}
        </div>

        <div className="text-lg leading-5 line-clamp-2 flex-shrink-0">
          {data?.name || 'n/a'}
        </div>

        <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
          {data?.external_sku || 'n/a'}
        </div>

        <div className="text-xs text-gray-400 truncate">
          {data?.internal_sku || 'n/a'}
        </div>

        <div className="flex items-center gap-2 truncate">
          <div className="me-auto text-nowrap font-medium truncate text-sm">
            <span className="font-semibold">Inv Stk:</span>{' '}
            <span className="">{data.location_stocks || 'n/a'}</span>
          </div>

          <div className="me-auto text-nowrap font-medium truncate text-sm">
            <span className="font-semibold">Total Stk:</span>{' '}
            <span className="">{data.total_stocks || 'n/a'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
