// ITEMS

import { useTranslation } from 'react-i18next'

export default function ItemCard({ data, actions: Actions }) {
  const { t } = useTranslation()
  return (
    <div className="rounded border p-2 h-full flex flex-col">
      <img
        src={data?.item_image || '/missing.png'}
        alt=""
        className="w-full aspect-square object-cover mb-2"
      />

      <div className="text-xs text-gray-600 font-semibold mb-1 truncate">
        {data.supplier?.name || 'n/a'}
      </div>

      <div className="text-lg leading-5 line-clamp-2 flex-grow-1 flex-shrink-0">
        {data.short_name || 'n/a'}
      </div>

      <div className="text-xs text-gray-500 font-medium tracking-wide truncate">
        {data.sku_number || 'n/a'}
      </div>

      <div className="text-xs text-gray-400 truncate">
        {data?.internet_sku_number || 'n/a'}
      </div>

      <div className="text-nowrap font-medium text-sm">
        <span className="font-semibold">{t('Onhand')}:</span>{' '}
        <span className="">{data.inventory || 0}</span>
      </div>
      <div className="text-nowrap font-medium text-sm">
        <span className="font-semibold">{t('Threshold')}:</span>{' '}
        <span className="">{data.order_threshold || 0}</span>
      </div>

      <div className="text-2xl font-bold text-gray-800">
        ${parseFloat(data.item_price || 0).toFixed(2)}
      </div>

      {/* ACTIONS */}

      <div>{Actions({ data: data })}</div>
    </div>
  )
}
