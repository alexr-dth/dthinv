import { useMemo, useState } from 'react'

export default function RowInventoryCard({ data = {}, actions = {} }) {
  const [expanded, setExpanded] = useState(false)
  const primary = actions['primary']

  const itemPerLocation = useMemo(() => {
    const formatted = {}
    data.inventory.forEach((inv) => {
      const invName = inv?.location?.name
      if (!formatted[invName]) {
        formatted[invName] = []
      }
      const { location, ...rest } = inv
      formatted[invName].push(rest)
    })

    return Object.entries(formatted)
  }, [data.inventory])

  console.log(itemPerLocation)

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
          <div className="flex justify-between">
            <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
              {data.sku_number || 'n/a'}
            </div>

            <div className="text-xs text-gray-400 truncate">
              {data?.internet_sku_number || 'n/a'}
            </div>
          </div>

          <div className="text-nowrap font-semibold text-sm">
            <span>Total Onhand:</span> {data?.inventory.length || 'n/a'}
          </div>
        </div>
      </div>
      {/* 
      <button
        className="text-xs  !text-gray-400 mx-auto block"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : '•••'}
      </button> */}

      {true && (
        <div className="text-sm">
          <hr className="my-1" />
          <ul className="px-3">
            {itemPerLocation.map(([locName, item]) => (
              <li className="flex gap-5 px-5">
                <span className="flex-1 text-start">{locName}:</span>
                <span className="flex-1 text-end"><span className='font-semibold'>{item.length}</span> <span className='italic text-gray-400 text-xs'>unit/s</span></span>
              </li>
            ))}
          </ul>

          {/* <div>
            <span className="font-bold">Description: </span>
            {data.item_desc || 'n/a'}
          </div>
          <div>
            <span className="font-bold">Notes: </span> {data.notes || 'n/a'}
          </div> */}
        </div>
      )}
    </div>
  )
}
