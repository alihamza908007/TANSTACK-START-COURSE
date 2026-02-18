// src/start.ts
import { createStart, createMiddleware } from '@tanstack/react-start'
import { authMiddleware } from './middlewares/auth'

const loggingMiddleware = createMiddleware({ type: 'request' }).server(
  ({ request, next }) => {
    const url = new URL(request.url)
    console.log('Incoming request:', url.pathname)
    return next()
  },
)

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [loggingMiddleware, authMiddleware],
  }
})
