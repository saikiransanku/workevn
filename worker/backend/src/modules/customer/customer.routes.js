import { Router } from 'express'
import { getBootstrap, patchProfile, toggleFavorite } from '../../controllers/customer.controller.js'
import { postLocation } from '../../controllers/location.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const customerRoutes = Router()

customerRoutes.use(requireRole('customer'))
customerRoutes.get('/bootstrap', asyncHandler(getBootstrap))
customerRoutes.patch('/profile', asyncHandler(patchProfile))
customerRoutes.post('/locations', asyncHandler(postLocation))
customerRoutes.patch('/workers/:workerId/favorite', asyncHandler(toggleFavorite))
