import { Router } from 'express'
import { requireRole } from '../../middlewares/rbac.js'

export const paymentRoutes = Router()

paymentRoutes.get('/health', requireRole('customer', 'admin'), (request, response) => {
  response.json({ ok: true, provider: 'workven-payments', mode: 'invoice-summary' })
})
