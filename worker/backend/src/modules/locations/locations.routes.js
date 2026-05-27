import { Router } from 'express'
import { postLocation } from '../../controllers/location.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const locationRoutes = Router()

locationRoutes.post('/', requireRole('customer'), asyncHandler(postLocation))
