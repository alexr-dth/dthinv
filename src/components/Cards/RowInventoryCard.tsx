import { useState } from 'react'

export default function RowInventoryCard({ data: inv = {}, actions = {} }) {
  const [expanded, setExpanded] = useState(false)
  const primary = actions['primary']
  const item = inv?.item || {}

  return (
    <div className="rounded border p-2">
      <div className="flex items-stretch gap-2 mb-1">
        <div className="w-1/4 self-center">
          <img
            src={item.item_image || '/missing.png'}
            alt=""
            className="object-contain"
          />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="text-xs text-gray-600 font-semibold truncate">
            {item.supplier?.name || 'n/a'}
          </div>
          <div className="text-lg leading-5 text-nowrap truncate flex-shrink-0">
            {item.short_name || 'n/a'}
          </div>
          <div className="flex [&>*]:flex-1 gap-2">
            <div className="text-xs text-gray-500 font-medium tracking-widest truncate">
              {item.sku_number || 'n/a'}
            </div>

            <div className="text-xs text-gray-500 font-medium tracking-widest truncate">
              {item?.internet_sku_number || 'n/a'}
            </div>
          </div>

          <div className="text-nowrap text-xs truncate italic text-gray-400">
            {item?.id || 'n/a'}
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
            <span className="font-bold">History: </span>
            <ul className="list-disc list-inside">
              {inv.history?.map((history) => (
                <li>{history}</li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-bold">Description: </span>
            {item.item_desc || 'n/a'}
          </div>
          <div>
            <span className="font-bold">Notes: </span> {item.notes || 'n/a'}
          </div>
        </div>
      )}
    </div>
  )
}
