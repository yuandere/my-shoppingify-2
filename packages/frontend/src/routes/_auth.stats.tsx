import { createFileRoute } from '@tanstack/react-router'

import PendingComponent from '@/components/PendingComponent'

export const Route = createFileRoute('/_auth/stats')({
  component: RouteComponent,
  pendingComponent: () => PendingComponent(),
})

function RouteComponent() {
  return 'Hello /_auth/stats!'
}
