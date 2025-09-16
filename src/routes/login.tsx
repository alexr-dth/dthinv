import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="sm:w-sm sm:mx-auto my-0 sm:my-5 border rounded p-3">
      <div className="flex justify-between">
        {import.meta.env.DEV && (
          <>
            <div className="divide-x ">
              <Link to="/" className="action-link !ps-0">
                Login as Admin
              </Link>
              <button
                onClick={() => window.history.back()}
                className="action-link px-1"
              >
                Login as Worker
              </button>
              <button
                onClick={() => window.history.back()}
                className="action-link px-1"
              >
                Create user
              </button>
            </div>
          </>
        )}
      </div>
      <h2 className="page-title">DTH Inventory App</h2>
      <input type="text" className='form-control w-full' />
      <input type="password" className='form-control w-full' />
    </div>
  )
}
