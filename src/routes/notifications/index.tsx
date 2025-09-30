import ItemSearchBarWithFilters from '@/components/Search/ItemSearchBarWithFilters'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  LucideAlertTriangle,
  LucideCheckCircle,
  LucideInfo,
  LucideXCircle,
} from 'lucide-react'
import { useState } from 'react'


/**
 * Notification Events
 * 1. When admin user approves an order
 * 2. When worker user creates order requests
 * 3. When 
 */


export const Route = createFileRoute('/notifications/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [activeModal, setActiveModal] = useState<{
    name: string
    data?: any
  } | null>(null)

  return (
    <>
      {activeModal != null && (
        <div className="fixed w-full h-full bg-black/60 top-0 left-0 place-content-center grid z-100">
          <div className="w-dvw max-w-md">
            {activeModal.name == 'addLocation' && (
              <>
                <div>Show Modal</div>
              </>
            )}
          </div>
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
        <h2 className="page-title">Notifications</h2>

        <div
          id="title-buttons"
          className="space-x-0.5 mt-6 mb-2 text-nowrap overflow-auto pb-2"
        >
          <button className="cursor-pointer text-sm px-2 rounded-full border border-gray-400 bg-green-50 text-green-800 font-bold">
            Approvals
          </button>
          <button className="cursor-pointer text-sm px-2 rounded-full border border-gray-400 bg-blue-50 text-blue-800 font-bold">
            Info
          </button>
          <button className="cursor-pointer text-sm px-2 rounded-full border border-gray-400 bg-yellow-50 text-yellow-800 font-bold">
            Warnings
          </button>
          <button className="cursor-pointer text-sm px-2 rounded-full border border-gray-400 bg-red-50 text-red-800 font-bold">
            Risks
          </button>
        </div>

        {/* TODO: Change this component to something that will make sense in this context */}

        <ul className="space-y-1">
          <NotificationCard type="success" orderId="101" />
          <NotificationCard type="info" orderId="202" />
          <NotificationCard type="warning" orderId="303" />
          <NotificationCard type="error" orderId="404" />
        </ul>
      </div>
    </>
  )
}

const NotificationCard = ({
  type = 'success',
  user = 'Jacob Pajunen',
  orderId = '101',
}) => {
  const variants = {
    success: {
      icon: <LucideCheckCircle className="h-5 w-5" />,
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      border: 'border-green-200',
      cardBg: 'bg-green-50',
    },
    info: {
      icon: <LucideInfo className="h-5 w-5" />,
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      border: 'border-blue-200',
      cardBg: 'bg-blue-50',
    },
    warning: {
      icon: <LucideAlertTriangle className="h-5 w-5" />,
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      border: 'border-yellow-200',
      cardBg: 'bg-yellow-50',
    },
    error: {
      icon: <LucideXCircle className="h-5 w-5" />,
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      border: 'border-red-200',
      cardBg: 'bg-red-50',
    },
  }
  const { icon, iconBg, iconText, border, cardBg } = variants[type]

  return (
    <li>
      <div
        className={`flex items-start gap-3 rounded border border-gray-400 ${cardBg} p-4`}
      >
        {/* Icon */}
        <div className="flex items-center self-stretch">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg} ${iconText}`}
          >
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="text-xs text-gray-400">
            {new Date().toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-sm text-gray-700">
            <span className="font-medium text-gray-900">{user}</span> approved
            your order{' '}
            <Link
              className="text-blue-600 font-medium hover:underline"
              to="/orders/$orderId"
              params={{ orderId }}
            >
              #{orderId}
            </Link>
          </p>
        </div>
      </div>
    </li>
  )
}
