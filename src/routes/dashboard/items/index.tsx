import { Card } from '@/components/ui/card'
import { getItemsFn } from '@/data/items'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => getItemsFn(),
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all hover:shadow-lg pt-0"
        >
          <Link to="/dashboard" className="block">
            {item.ogImage && (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={item.ogImage}
                  alt={item.title ?? 'Article Thumbnail'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
          </Link>
        </Card>
      ))}
    </div>
  )
}
