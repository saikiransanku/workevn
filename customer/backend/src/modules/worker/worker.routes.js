import { Router } from 'express'
import {
  getWorkerHome,
  patchAvailability,
  patchJobStatus,
  postProof,
} from '../../controllers/worker.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const workerRoutes = Router()

workerRoutes.use(requireRole('worker'))
workerRoutes.get('/bootstrap', asyncHandler(getWorkerHome))
workerRoutes.patch('/availability', asyncHandler(patchAvailability))
workerRoutes.patch('/jobs/:jobId/status', asyncHandler(patchJobStatus))
workerRoutes.post('/jobs/:jobId/proof', asyncHandler(postProof))
