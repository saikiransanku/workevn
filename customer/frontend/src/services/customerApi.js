import { createApiClient } from '../../../shared/services/apiClient.js'

const api = createApiClient('customer')

export const customerApi = {
  bootstrap: () => api.get('/customer/bootstrap'),
  workerSuggestions: (serviceId, locationId) =>
    api.get(`/workers/suggestions?serviceId=${encodeURIComponent(serviceId)}&locationId=${encodeURIComponent(locationId)}`),
  estimate: (payload) => api.post('/bookings/estimate', payload),
  createBooking: (payload) => api.post('/bookings', payload),
  repeatBooking: (bookingId) => api.post(`/bookings/${bookingId}/repeat`, {}),
  rescheduleBooking: (bookingId, slot) => api.patch(`/bookings/${bookingId}/reschedule`, { slot }),
  cancelBooking: (bookingId, reason) => api.patch(`/bookings/${bookingId}/cancel`, { reason }),
  sendMessage: (bookingId, message) => api.post(`/bookings/${bookingId}/messages`, { message }),
  saveLocation: (payload) => api.post('/customer/locations', payload),
  updateProfile: (payload) => api.patch('/customer/profile', payload),
  toggleFavorite: (workerId) => api.patch(`/customer/workers/${workerId}/favorite`, {}),
  createComplaint: (payload) => api.post('/complaints', payload),
  createReview: (payload) => api.post('/reviews', payload),
}
