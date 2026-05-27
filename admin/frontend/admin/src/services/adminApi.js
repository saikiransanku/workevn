import { createApiClient } from '../../../shared/services/apiClient.js'

const api = createApiClient('admin')

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  decideWorker: (workerId, decision, notes = '') =>
    api.patch(`/admin/workers/${workerId}/verification`, { decision, notes }),
  updateComplaint: (complaintId, payload) => api.patch(`/admin/complaints/${complaintId}`, payload),
  updateSettings: (payload) => api.patch('/admin/settings', payload),
}
