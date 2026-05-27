import {
  decideWorkerVerification,
  getAdminDashboard,
  updateCommissionSettings,
  updateComplaintStatus,
} from '../services/admin.service.js'
import { requireFields } from '../validators/request.js'

export async function getDashboard(request, response) {
  response.json(await getAdminDashboard())
}

export async function patchWorkerVerification(request, response) {
  requireFields(request.body, ['decision'])
  response.json(
    await decideWorkerVerification(
      request.params.workerId,
      request.body.decision,
      request.body.notes,
    ),
  )
}

export async function patchComplaint(request, response) {
  response.json(await updateComplaintStatus(request.params.complaintId, request.body))
}

export async function patchSettings(request, response) {
  response.json(await updateCommissionSettings(request.body))
}
