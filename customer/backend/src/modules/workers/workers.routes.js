import { Router } from 'express'
import { suggestWorkers } from '../../controllers/booking.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const workersRoutes = Router()

workersRoutes.use(requireRole('customer', 'admin'))
workersRoutes.get('/suggestions', asyncHandler(suggestWorkers))
