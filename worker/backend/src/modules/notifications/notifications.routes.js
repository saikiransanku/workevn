import { Router } from 'express'
import { requireRole } from '../../middlewares/rbac.js'

export const notificationRoutes = Router()

notificationRoutes.get('/health', requireRole('customer', 'worker', 'admin'), (request, response) => {
  response.json({ ok: true, provider: 'workven-notifications' })
})
