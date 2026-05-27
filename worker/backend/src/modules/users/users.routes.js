import { Router } from 'express'
import { patchProfile } from '../../controllers/customer.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const userRoutes = Router()

userRoutes.patch('/me', requireRole('customer'), asyncHandler(patchProfile))
