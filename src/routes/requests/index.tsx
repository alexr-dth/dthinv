import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideMenu } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/requests/')({
  component: RouteComponent,
})

const requests = []

function RouteComponent() {
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  const { t } = useTranslation()
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-lg">
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
          <div>
            <TitleDivider title={'Today'} />
            <div className="space-y-1">
              <SupplierProductSetWithActions
                set={{}}
                supplierName="Home Depot"
              />
              <SupplierProductSetWithActions
                set={{}}
                supplierName="Hardware Resources"
              />
              <SupplierProductSetWithActions set={{}} supplierName="Amazon" />
            </div>
          </div>
          <div>
            <TitleDivider title={'Sept 12, 2025'} />
            <div className="space-y-1">
              <SupplierProductSetWithActions
                set={{}}
                supplierName="Hardware Resources"
              />
            </div>
          </div>

          <div>
            <div className="space-y-1">
              <TitleDivider title={'Sept 11, 2025'} />
            </div>
          </div>

          <div>
            <div className="space-y-1">
              <TitleDivider title={'Sept 10, 2025'} />
            </div>
          </div>
        </div>

        <button className="action-link block mx-auto text-sm font-bold py-4">
          Load More...
        </button>
      </div>
    </>
  )
}

const TitleDivider = ({ title }) => {
  return (
    <div className="mt-3 flex items-center flex-nowrap w-full text-blue-400">
      <div className="flex-grow border-t border-dashed"></div>
      <span className="mx-4 ">{title}</span>
      <div className="flex-grow border-t border-dashed"></div>
    </div>
  )
}

const sampleItem = {
  sku_number: 856320,
  internet_sku_number: 100124691,
  item_price: 2.2,
  inventory: -3,
  short_name: '1" EMT Straps 4-Pack',
}

const SupplierProductSetWithActions = ({ set, supplierName }) => {
  const [expanded, setExpanded] = useState(false)
  const [selectedAll, selectAll] = useState(false)
  const totalPrice = (items = []) =>
    items.reduce(
      (sum, { price = 0, approved_qty }) => sum + price * approved_qty,
      0,
    )

  const totalUnits = (items = []) =>
    items.reduce((sum, { approved_qty }) => sum + approved_qty, 0)

  return (
    <div>
      <div className="border rounded">
        <h3
          className={` p-2 flex items-center gap-1 ${expanded && 'border-b-1'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <h5 className="text-lg font-semibold uppercase">{supplierName}</h5>
            {!expanded && (
              <span className="text-sm text-gray-500">
                $5000 <span className="text-xs">(20 types/30 units)</span>
              </span>
            )}
          </div>

          <span className="ms-auto">{expanded ? '[-]' : '[+]'}</span>
        </h3>

        {expanded && (
          <div className="px-2 pb-2">
            <ul className="space-y-2 divide-y divide-gray-400 pb-2">
              <PendingRequestedCard
                data={sampleItem}
                selected={selectedAll}
                requestedBy="Manual Request"
              />
              <CompletedRequestedCard data={sampleItem} />
              <PendingRequestedCard
                data={sampleItem}
                selected={selectedAll}
                requestedBy="System Request"
              />

              {/* {set.items.map((item) => (
              ))} */}
            </ul>

            <div className="text-end text-sm py-2 bg-gray-200 p-2 rounded shadow">
              <div className="text-sm">
                Total (2 types/10 units):{' '}
                <span className="font-bold text-xl">$5000</span>
              </div>

              <div className="flex">
                <button
                  className="action-link text-xs"
                  onClick={() => selectAll(false)}
                >
                  Select none
                </button>
                <button
                  className="action-link text-xs"
                  onClick={() => selectAll(true)}
                >
                  Select all
                </button>
                {/* <button className="action-link !text-lg font-bold ms-auto">
                  Proceed→
                </button> */}
                <Link
                  to="/orders/new"
                  className="action-link !text-lg font-bold ms-auto"
                >
                  Proceed→
                </Link>
              </div>
            </div>

            {/* <div className="py-2 text-center">No items added</div> */}
          </div>
        )}
      </div>
    </div>
  )
}

const PendingRequestedCard = ({
  data: item,
  selected,
  requestedBy = 'Manual Request',
}) => {
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState(false)
  const id = useId()
  useEffect(() => {
    setChecked(selected)
  }, [selected])

  return (
    <div className="mt-2">
      <div className="flex items-stretch gap-2 mb-1">
        <label className="w-1/4" htmlFor={id}>
          <img src={'/pliers.jpg'} alt="" className="object-contain" />
        </label>
        <label className="w-3/4 flex flex-col" htmlFor={id}>
          <div className="font-bold text-xs text-gray-400">{requestedBy}</div>
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
            onChange={() => {
              setChecked(!checked)
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

const CompletedRequestedCard = ({ data: item }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="mt-2 border-green-600 border-s-5 rounded-tl-md rounded-bl-md">
      <div className="flex items-stretch gap-2 mb-1">
        <div className="w-1/4">
          <img src={'/pliers.jpg'} alt="" className="object-contain" />
        </div>
        <div className="w-3/4 flex flex-col">
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

              <div className="text-nowrap font-medium text-sm text-green-600">
                COMPLETED
              </div>
            </div>

            <div className="flex-1 text-end">
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
