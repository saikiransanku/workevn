import { createApiClient } from '../../../shared/services/apiClient.js'

const api = createApiClient('worker')

export const workerApi = {
  bootstrap: () => api.get('/worker/bootstrap'),
  setAvailability: (availability) => api.patch('/worker/availability', { availability }),
  updateJobStatus: (jobId, status) => api.patch(`/worker/jobs/${jobId}/status`, { status }),
  addProof: (jobId, payload) => api.post(`/worker/jobs/${jobId}/proof`, payload),
}
