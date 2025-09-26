import { Link } from 'lucide-react'
import { useId, useState } from 'react'

export default function PendingRequestedCard({
  data,
  selected: checked,
  setSelectedIds,
}) {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const item = data.item
  return (
    <div className="mt-2">
      <div className="flex items-stretch gap-2 mb-1">
        <label className="w-1/4 self-center" htmlFor={id}>
          <img
            src={item?.item_image || '/missing.png'}
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
              setSelectedIds((prev) => {
                return !checked
                  ? [...prev, data.id] // add
                  : prev.filter((i) => i != data.id) // subtract
              })
            }}
          />
        </div>
      </div>

      <button
        className="text-xs  !text-gray-400 mx-auto block px-5 py-1"
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
