import { Router } from 'express'
import {
  getDashboard,
  patchComplaint,
  patchSettings,
  patchWorkerVerification,
} from '../../controllers/admin.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const adminRoutes = Router()

adminRoutes.use(requireRole('admin'))
adminRoutes.get('/dashboard', asyncHandler(getDashboard))
adminRoutes.patch('/workers/:workerId/verification', asyncHandler(patchWorkerVerification))
adminRoutes.patch('/complaints/:complaintId', asyncHandler(patchComplaint))
adminRoutes.patch('/settings', asyncHandler(patchSettings))
