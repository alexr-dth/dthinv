import { createFileRoute, Link } from '@tanstack/react-router'
import { LucidePackageCheck, LucidePackageSearch } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// MAIN APP
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { t } = useTranslation()
  return (
    <div className="page-container">
      <div className="flex justify-between">
        <div className="divide-x ">
          <Link to="/" className="action-link !ps-0" disabled>
            {t('Home')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="action-link px-1"
            disabled
          >
            {t('Back')}
          </button>
        </div>
      </div>
      <h2 className="text-2xl text-center mb-3 font-bold">DTH Inventory App</h2>

      <div className="flex flex-col gap-2 items-center pb-5">
        {/* <Link to="/notifications" className="btn w-full">
              {t('Notifications')}
            </Link> */}

        <TitleDivider title={'Utility'} />
        <div className="flex gap-3 w-full">
          <Link
            to="/request"
            className="flex-1 btn aspect-square grid place-content-center"
          >
            <div className="flex justify-center">
              <LucidePackageSearch size={48} strokeWidth={1.5} />
            </div>

            {t('Request')}
          </Link>

          <Link
            to="/receive"
            className="flex-1 btn aspect-square grid place-content-center"
          >
            <div className="flex justify-center">
              <LucidePackageCheck size={48} strokeWidth={1.5} />
            </div>
            {t('Receive')}
          </Link>
        </div>

        <TitleDivider title={'Overview'} />
        <Link to="/requests" className="btn w-full">
          {t('Item Requests')}
        </Link>

        <Link to="/orders" className="btn w-full">
          {t('Orders')}
        </Link>

        <Link to="/locations" className="btn w-full">
          {t('Storage Locations')}{' '}
          <span className="text-xs text-red-500">(*buggy)</span>
        </Link>

        <Link to="/" className="btn w-full disabled">
          {t('Consumed Items')}
        </Link>

        <Link to="/" className="btn w-full disabled" disabled>
          {t('Return Materials')}
        </Link>

        <TitleDivider title={'Collection'} />
        <Link to="/items" className="btn w-full">
          {t('Items')}/{t('Products')}<span className="text-xs text-green-700">(*okay)</span>
        </Link>

        <Link to="/inventory" className="btn w-full">
          {t('Inventory')}
        </Link>
      </div>
    </div>
  )
}

const TitleDivider = ({ title }) => {
  return (
    <div className="mt-3 flex items-center flex-nowrap w-full">
      <div className="flex-grow border-t border-dashed"></div>
      <span className="mx-4 text-xs text-gray-600">{title}</span>
      <div className="flex-grow border-t border-dashed"></div>
    </div>
  )
}
