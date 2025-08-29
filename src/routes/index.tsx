import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

// MAIN APP
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [activeMenu, setActiveMenu] = useState('main')
  return (
    <div className=" sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3">
      <div className="divide-x ">
        <Link to="/" className="action-link !ps-0 disabled" disabled>
          Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="action-link px-1"
          disabled
        >
          Back
        </button>
      </div>
      <h2 className="text-2xl text-center mb-3 font-bold">DTH Inventory App</h2>

      <div className="flex flex-col gap-2 items-center pb-5">
        {activeMenu === 'main' && (
          <>
            <Link to="/" className="btn w-full disabled" disabled>
              Notifications
            </Link>

            <Link to="/orders" className="btn w-full">
              Orders
            </Link>

            <Link to="/items" className="btn w-full">
              Items
            </Link>

            <Link to="/receive" className="btn w-full">
              Receive
            </Link>

            <Link to="/" className="btn w-full disabled" disabled>
              Request
            </Link>

            <button
              className="btn w-full"
              onClick={() => setActiveMenu('inventory')}
            >
              Inventory
            </button>
          </>
        )}

        {activeMenu === 'inventory' && (
          <>
            <button
              className="action-link underline"
              onClick={() => setActiveMenu('main')}
            >
              Back
            </button>

            <Link to="/" className="btn w-full disabled" disabled>
              Log Inventory Materials
            </Link>

            <Link to="/" className="btn w-full disabled" disabled>
              Return Materials
            </Link>

            <Link to="/locations" className="btn w-full">
              Inventory Locations
            </Link>

            <Link to="/inventory" className="btn w-full">
              Update Inventory Onhand
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
