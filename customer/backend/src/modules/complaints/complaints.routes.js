import { Router } from 'express'
import { postComplaint } from '../../controllers/complaint.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const complaintRoutes = Router()

complaintRoutes.post('/', requireRole('customer'), asyncHandler(postComplaint))
