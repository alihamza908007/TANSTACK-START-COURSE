import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/import')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1>Import Content</h1>
          <p>Import your content from other sources</p>
        </div>
      </div>
    </div>
  )
}
