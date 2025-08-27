import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

// MAIN APP
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [activeMenu, setActiveMenu] = useState('main')
  return (
    <div className=" mx-3 sm:w-sm sm:mx-auto mt-5 border rounded p-3">
      <h3 className="font-semibold mb-3 text-xl">Inventory App</h3>

      <div className="flex flex-col gap-2 items-center">
        {activeMenu === 'main' && (
          <>
            <Link to="/" className="btn disabled" disabled>
              Notifications
            </Link>

            <Link to="/" className="btn disabled" disabled>
              Order
            </Link>

            <Link to="/" className="btn disabled">
              Items
            </Link>

            <Link to="/receive" className="btn">
              Receive
            </Link>

            <Link to="/" className="btn disabled" disabled>
              Request
            </Link>

            <button className="btn" onClick={() => setActiveMenu('inventory')}>
              Inventory
            </button>
          </>
        )}

        {activeMenu === 'inventory' && (
          <>
            <button className="btn" onClick={() => setActiveMenu('main')}>
              Back
            </button>

            <Link to="/" className="btn disabled" disabled>
              Log Inventory Materials
            </Link>

            <Link to="/" className="btn disabled" disabled>
              Return Materials
            </Link>

            <Link to="/locations" className="btn" disabled>
              Inventory Locations
            </Link>

            <Link to="/" className="btn disabled" disabled>
              Update Inventory Onhand
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
