import { randomUUID } from 'node:crypto'

export function attachRequestContext(request, response, next) {
  request.context = {
    requestId: request.headers['x-request-id'] || randomUUID(),
    startedAt: Date.now(),
  }
  response.setHeader('X-Request-Id', request.context.requestId)
  next()
}
