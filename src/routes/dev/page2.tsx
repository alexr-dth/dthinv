import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dev/page2')({
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/dev/page2' })
  const [ids, setIds] = useState(search.testIds)


  

  return <div>{JSON.stringify(search.testIds)}</div>
}
