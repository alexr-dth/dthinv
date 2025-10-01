import { useTranslation } from 'react-i18next'
import { fetchItems, fetchItemsInventory, fetchSuppliers } from '@/api/api'
import ErrorScreen from '@/components/ErrorScreen'
import PageLoader from '@/components/PageLoader'
import InventorySearchWithFilters from '@/components/Search/InventorySearchWithFilters'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { LucideListFilter } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import RowInventoryCard from '@/components/Cards/RowInventoryCard'

const sampleObj = {
  id: '6be28413-fe3a-47e2-9b15-a54d51fb28de',
  sku_number: '709237',
  internet_sku_number: '206101783',
  internal_sku: null,
  dth_sku: null,
  temp_internal_sku: 'DTH53787205',
  material_id: 271,
  upc: ['707392361367'],
  supplier_id: 'e2e4046c-d953-4273-883d-0c965e79e971',
  item_desc: '#8 x 1-1/4 in. #2 Phillips, Wafer-Head Wood Screw (100-Pack)',
  item_desc_mandarin: '#8 x 1-1/4 英寸 #2 十字槽圆头木螺钉（100 件装）',
  short_name: '#8 x 1-1/4" Phillips Wafer-Head Screws',
  item_brand: 'Simpson Strong-Tie',
  item_brand_mandarin: '辛普森强领带',
  department_name: 'HARDWARE',
  department_name_mandarin: '硬件',
  item_details: null,
  item_details_mandarin: null,
  template: null,
  item_price: 12.78,
  default_order_qty: 6,
  pack_size: 100,
  label_size: null,
  inventory: [
    {
      id: 'd042a2b7-4c94-47a9-aad6-1ff10b63a9d0',
      is_pack: null,
      item_id: '6be28413-fe3a-47e2-9b15-a54d51fb28de',
      location: {
        id: 'ba7ba039-28a4-459f-9d37-b2eb18842f7d',
        name: 'Shelf A1-1',
        notes: 'Bin size: L',
        parent_id: '10d04631-7fcf-460f-951a-a6f6a9508002',
        barcode_qr: 'LOC-SHELF-A1-1',
        created_at: '2025-10-01T02:31:59.007102+00:00',
        description: 'Shelf row 1 (fast picks)',
        order_weight: 1.11,
      },
      pack_size: null,
      barcode_qr: 'INV-001',
      created_at: '2025-10-01T02:33:28.847389+00:00',
      location_id: 'ba7ba039-28a4-459f-9d37-b2eb18842f7d',
    },
    {
      id: '3b0eca71-6e30-4938-8c37-a38ade5d4ce3',
      is_pack: null,
      item_id: '6be28413-fe3a-47e2-9b15-a54d51fb28de',
      location: {
        id: 'ba7ba039-28a4-459f-9d37-b2eb18842f7d',
        name: 'Shelf A1-1',
        notes: 'Bin size: L',
        parent_id: '10d04631-7fcf-460f-951a-a6f6a9508002',
        barcode_qr: 'LOC-SHELF-A1-1',
        created_at: '2025-10-01T02:31:59.007102+00:00',
        description: 'Shelf row 1 (fast picks)',
        order_weight: 1.11,
      },
      pack_size: null,
      barcode_qr: 'INV-002',
      created_at: '2025-10-01T02:33:28.847389+00:00',
      location_id: 'ba7ba039-28a4-459f-9d37-b2eb18842f7d',
    },
    {
      id: '2a961a8d-c0ff-4549-96eb-f840dea48130',
      is_pack: null,
      item_id: '6be28413-fe3a-47e2-9b15-a54d51fb28de',
      location: {
        id: 'ba7ba039-28a4-459f-9d37-b2eb18842f7d',
        name: 'Shelf A1-1',
        notes: 'Bin size: L',
        parent_id: '10d04631-7fcf-460f-951a-a6f6a9508002',
        barcode_qr: 'LOC-SHELF-A1-1',
        created_at: '2025-10-01T02:31:59.007102+00:00',
        description: 'Shelf row 1 (fast picks)',
        order_weight: 1.11,
      },
      pack_size: null,
      barcode_qr: 'INV-003',
      created_at: '2025-10-01T02:33:28.847389+00:00',
      location_id: 'ba7ba039-28a4-459f-9d37-b2eb18842f7d',
    },
    {
      id: '33ce99e8-3a11-4bc9-ad3c-20cac4af91b8',
      is_pack: null,
      item_id: '6be28413-fe3a-47e2-9b15-a54d51fb28de',
      location: {
        id: 'a3396c50-c977-41d5-90e3-368c69cec89d',
        name: 'Shelf A1-2',
        notes: 'Bin size: M',
        parent_id: '10d04631-7fcf-460f-951a-a6f6a9508002',
        barcode_qr: 'LOC-SHELF-A1-2',
        created_at: '2025-10-01T02:31:59.007102+00:00',
        description: 'Shelf row 2 (fast picks)',
        order_weight: 1.12,
      },
      pack_size: null,
      barcode_qr: 'INV-004',
      created_at: '2025-10-01T02:33:28.847389+00:00',
      location_id: 'a3396c50-c977-41d5-90e3-368c69cec89d',
    },
    {
      id: 'e4f43d42-727d-4df0-bfc3-fa177d9730c1',
      is_pack: null,
      item_id: '6be28413-fe3a-47e2-9b15-a54d51fb28de',
      location: {
        id: 'a3396c50-c977-41d5-90e3-368c69cec89d',
        name: 'Shelf A1-2',
        notes: 'Bin size: M',
        parent_id: '10d04631-7fcf-460f-951a-a6f6a9508002',
        barcode_qr: 'LOC-SHELF-A1-2',
        created_at: '2025-10-01T02:31:59.007102+00:00',
        description: 'Shelf row 2 (fast picks)',
        order_weight: 1.12,
      },
      pack_size: null,
      barcode_qr: 'INV-005',
      created_at: '2025-10-01T02:33:28.847389+00:00',
      location_id: 'a3396c50-c977-41d5-90e3-368c69cec89d',
    },
  ],
  inventory_location: null,
  inventory_location_id: null,
  reorder_point: 0,
  is_reorder: true,
  keywords: null,
  keywords_eng_to_ch: null,
  keywords_ch: null,
  keywords_ch_to_eng: null,
  item_image: 'http://localhost:5012/images/206101783.jpg',
  kanban_image: '1753382008679.png',
  label_pdf_url: null,
  link: null,
  created_at: '2025-10-01T02:09:56.419981+00:00',
  latest_manual_log_date: '2025-06-18T14:30:49.909096+00:00',
  supplier: {
    id: 'e2e4046c-d953-4273-883d-0c965e79e971',
    name: 'Home Depot',
    barcode_qr: 'HD-001-QR',
    created_at: '2025-10-01T02:31:58.846492+00:00',
  },
}

export const Route = createFileRoute('/inventory/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState(null)

  const {
    data: itemsInventory = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items/inventory'],
    queryFn: fetchItemsInventory,
  })

  const closeModal = () => setActiveModal(null)

  if (isLoading) return <PageLoader />
  if (error) return <ErrorScreen error={error} />
  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {/* {activeModal.name == 'editItem' && (
              <EditItemModal
                data={activeModal.data}
                cancelCallback={closeModal}
                saveCallback={editItem}
              />
            )} */}
          </div>
        </div>
      )}

      <div className="sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3">
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
          {/* <button className="action-link">
            Save
          </button> */}
        </div>
        <h2 className="page-title">Onhand Items</h2>

        <div
          id="title-buttons"
          className="divide-x text-nowrap overflow-auto pb-1"
        >
          <Link className="action-link" to="/request">
            {t('Request item')}
          </Link>
        </div>

        <InventorySearchWithFilters />

        <div className="space-y-2">
          {itemsInventory?.map((item) => (
            <RowInventoryCard key={item.id} data={item} />
          ))}
        </div>
      </div>
    </>
  )
}
