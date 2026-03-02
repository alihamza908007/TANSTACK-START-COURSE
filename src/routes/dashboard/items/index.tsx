import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getItemsFn } from '@/data/items'
import { ItemStatus } from '@/generated/prisma/enums'
import { copyToClipboard } from '@/lib/clipboard'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Copy, Inbox } from 'lucide-react'
import { zodValidator } from '@tanstack/zod-adapter'
import z from 'zod'
import { Suspense, use, useEffect, useState } from 'react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

const itemsSearchSchema = z.object({
  q: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})

type ItemsSearch = z.infer<typeof itemsSearchSchema>

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => ({ itemsPromise: getItemsFn() }),
  validateSearch: zodValidator(itemsSearchSchema),
})

function ItemsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="group overflow-hidden transition-all pt-0">
          <div className="aspect-video w-full bg-muted">
            <Skeleton className="h-full w-full" />
          </div>

          <CardHeader className="space-y-3 pt-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />

              <Skeleton className="size-8 rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-6 w-[90%]" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function ItemsList({
  q,
  status,
  data,
}: {
  q: ItemsSearch['q']
  status: ItemsSearch['status']
  data: ReturnType<typeof getItemsFn>
}) {
  const items = use(data)
  const filteredItems = items.filter((item) => {
    const matchQuery =
      q === '' ||
      item.title?.toLowerCase().includes(q.toLowerCase()) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(q.toLowerCase()))

    const matchStatus = status === 'all' || item.status === status

    return matchQuery && matchStatus
  })
  if (filteredItems.length === 0) {
    return (
      <Empty className="border rounded-lg h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox className="size-12" />
          </EmptyMedia>
          <EmptyTitle>
            {items.length === 0
              ? 'No saved items found'
              : 'No matching items found'}
          </EmptyTitle>
          <EmptyDescription>
            {items.length === 0
              ? 'Import a URL to get started with saving your content'
              : 'No items match your current search filters'}
          </EmptyDescription>
        </EmptyHeader>
        {items.length === 0 && (
          <EmptyContent>
            <Link className={buttonVariants()} to="/dashboard/import">
              Import URL
            </Link>
          </EmptyContent>
        )}
      </Empty>
    )
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredItems.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all hover:shadow-lg pt-0"
        >
          <Link
            to="/dashboard/items/$itemId"
            params={{ itemId: item.id }}
            className="block"
          >
            {item.ogImage && (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={item.ogImage}
                  alt={item.title ?? 'Article Thumbnail'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}
            <CardHeader className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    item.status === 'COMPLETED' ? 'default' : 'secondary'
                  }
                >
                  {item.status.toLowerCase()}
                </Badge>
                <Button
                  onClick={async (e) => {
                    e.preventDefault()
                    await copyToClipboard(item.url)
                  }}
                  variant="outline"
                  size="icon"
                  className="size-8"
                >
                  <Copy className="size-4" />
                </Button>
              </div>

              <CardTitle className="line-clamp-1 text-xl leading-snug group-hover:text-primary transition-colors">
                {item.title}
              </CardTitle>
              {item.author && (
                <p className="text-sm text-muted-foreground">
                  Author : {item.author}
                </p>
              )}
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}

function RouteComponent() {
  const { itemsPromise } = Route.useLoaderData()
  const { status, q } = Route.useSearch()
  const [searchInput, setSearchInput] = useState(q)
  const navigate = useNavigate({ from: Route.fullPath })
  useEffect(() => {
    if (searchInput === q) return

    const timeoutId = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: searchInput }) })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchInput, navigate, q])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">Your saved items and content!</p>
      </div>
      <div className="flex gap-4">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title or tags"
        />
        <Select
          value={status}
          onValueChange={(v) =>
            navigate({
              search: (prev) => ({ ...prev, status: v as typeof status }),
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Suspense fallback={ItemsGridSkeleton()}>
        <ItemsList q={q} status={status} data={itemsPromise} />
      </Suspense>
    </div>
  )
}
