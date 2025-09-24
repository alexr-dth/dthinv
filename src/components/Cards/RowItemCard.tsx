import { useState } from 'react'

export default function RowItemCard({ data = {}, actions = {} }) {
  const [expanded, setExpanded] = useState(false)
  const primary = actions['primary']

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
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
                {data.sku_number || 'n/a'}
              </div>

              <div className="text-xs text-gray-400 truncate">
                {data?.internet_sku_number || 'n/a'}
              </div>

              <div className="text-nowrap font-semibold text-sm">
                <span>Onhand:</span> {data.inventory || 0}
              </div>
              <div className="text-nowrap font-semibold text-sm">
                <span>Reorder Qty:</span> {data.default_order_qty || 0}
              </div>
            </div>

            <div className="flex-1 text-end">
              <div>${parseFloat(data.item_price || 0).toFixed(2)}</div>
              <button
                className="action-link text-xs"
                onClick={() => primary?.cb(data.id)}
              >
                {primary?.label}
              </button>
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
