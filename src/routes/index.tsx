import { createFileRoute, Link } from '@tanstack/react-router'

// MAIN APP
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className=" mx-3 sm:w-sm sm:mx-auto mt-5 border rounded p-3">
      <h3 className="font-semibold mb-3 text-xl">Inventory App</h3>

      <div className="flex flex-col gap-2 items-center">
        <Link
          to="/locations"
          className="bg-gray-100 w-full p-2 text-center border rounded cursor-pointer"
        >
          Manage locations
        </Link>
        <Link
          to="/receive"
          className="bg-gray-100 w-full p-2 text-center border rounded cursor-pointer"
        >
          Receive
        </Link>
      </div>
    </div>
  )
}
