import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dev/page1')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: '/' })
  const handlePageChange = () => {
    navigate({
      to: '/dev/page2',
      search: (prev) => ({
        ...prev,
        testIds: ['1', '2', '3'],
      }),
    })
  }
  return (
    <div className="btn" onClick={handlePageChange}>
      Page 2
    </div>
  )
}
