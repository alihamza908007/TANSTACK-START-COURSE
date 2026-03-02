import { prisma } from '@/db'
import { firecrawl } from '@/lib/firecrawl'
import { bulkImportSchema, extractSchema, importSchema } from '@/schemas/import'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { authFnMiddleware } from '@/middlewares/auth'
import { notFound } from '@tanstack/react-router'

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: context.session?.user.id,
        status: 'PROCESSING',
      },
    })
    try {
      const result = await firecrawl.scrape(data.url, {
        formats: [
          'markdown',
          {
            type: 'json',
            schema: extractSchema,
            //
          },
        ],
        location: { country: 'US', languages: ['en'] },
        onlyMainContent: true,
      })
      const jsonData = result.json as z.infer<typeof extractSchema>
      console.log('Extracted JSON Data:', jsonData)
      let publishedAt = null
      if (jsonData.publishedAt) {
        const parsed = new Date(jsonData.publishedAt)
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed
        }
      }
      const updatedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          title: result.metadata?.title || null,
          content: result.markdown || null,
          ogImage: result.metadata?.ogImage || null,
          author: jsonData.author || null,
          publishedAt: publishedAt,
          status: 'COMPLETED',
        },
      })
      return updatedItem
    } catch {
      const failedItem = await prisma.savedItem.update({
        where: {
          id: item.id,
        },
        data: {
          status: 'FAILED',
        },
      })
      return failedItem
    }
  })

export const mapUrlFn = createServerFn({ method: 'POST' })
  .inputValidator(bulkImportSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const result = await firecrawl.map(data.url, {
      limit: 25,
      search: data.search,
      location: {
        country: 'US',
        languages: ['en'],
      },
    })
    return result
  })

export const bulkScrapeURLsFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      urls: z.array(z.string().url()),
    }),
  )
  .handler(async ({ data, context }) => {
    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i]
      const item = await prisma.savedItem.create({
        data: {
          url: url,
          userId: context.session?.user.id,
          status: 'PENDING',
        },
      })

      try {
        const result = await firecrawl.scrape(url, {
          formats: [
            'markdown',
            {
              type: 'json',
              schema: extractSchema,
              //
            },
          ],
          location: { country: 'US', languages: ['en'] },
          onlyMainContent: true,
        })
        const jsonData = result.json as z.infer<typeof extractSchema>
        console.log('Extracted JSON Data:', jsonData)
        let publishedAt = null
        if (jsonData.publishedAt) {
          const parsed = new Date(jsonData.publishedAt)
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed
          }
        }
        await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            title: result.metadata?.title || null,
            content: result.markdown || null,
            ogImage: result.metadata?.ogImage || null,
            author: jsonData.author || null,
            publishedAt: publishedAt,
            status: 'COMPLETED',
          },
        })
      } catch {
        await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            status: 'FAILED',
          },
        })
      }
    }
  })

export const getItemsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const items = await prisma.savedItem.findMany({
      where: {
        userId: context.session?.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return items
  })

export const getItemById = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.findUnique({
      where: {
        id: data.id,
        userId: context.session?.user.id,
      },
    })
    if (!item) {
      throw notFound()
    }
    return item
  })
