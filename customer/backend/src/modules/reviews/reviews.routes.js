import { Router } from 'express'
import { postReview } from '../../controllers/review.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const reviewRoutes = Router()

reviewRoutes.post('/', requireRole('customer'), asyncHandler(postReview))
