import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import createInventoryPerLocation from '@/helpers/createInventoryPerLocation'

export default function RowTotalInventoryCard({ data = {}, actions = {} }) {
  const [expanded, setExpanded] = useState(false)
  const primary = actions['primary']

  const inventoryPerLocation = useMemo(
    () => createInventoryPerLocation(data.inventory),
    [data],
  )

  return (
    <div className="rounded border p-2">
      <div className="flex items-stretch gap-2 mb-1">
        <div className="w-1/4 self-center">
          <img
            src={data.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="text-xs text-gray-600 font-semibold truncate">
            {data.supplier?.name || 'n/a'}
          </div>
          <div className="text-lg leading-5 text-nowrap truncate flex-shrink-0">
            {data.short_name || 'n/a'}
          </div>
          <div className="flex [&>*]:flex-1 gap-2">
            <div className="text-xs text-gray-500 font-medium tracking-widest truncate">
              {data.sku_number || 'n/a'}
            </div>

            <div className="text-xs text-gray-500 font-medium tracking-widest truncate">
              {data?.internet_sku_number || 'n/a'}
            </div>
          </div>

          <div className="text-nowrap font-semibold text-sm">
            <span>Total Onhand:</span> {data?.inventory.length || 'n/a'}
            <Link
              to="/items/$itemId"
              params={{ itemId: data.id }}
              className="action-link text-xs"
            >
              View
            </Link>
          </div>
        </div>
      </div>

      <div className="text-sm">
        <hr className="my-1" />
        <ul className="px-3">
          {inventoryPerLocation.map((location) => (
            <li className="flex gap-5 px-5" key={location.id}>
              <span className="flex-1 text-start">{location.name}:</span>
              <span className="flex-1 text-end">
                <span className="font-semibold">
                  {location?.inventory?.length}
                </span>{' '}
                <span className="italic text-gray-400 text-xs">unit/s</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
