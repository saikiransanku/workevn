import { updateDatabase } from '../db/fileDatabase.js'
import { createId } from '../utils/id.js'

export async function createComplaint(customerId, payload) {
  return updateDatabase((database) => {
    const booking = database.bookings.find((item) => item.id === payload.bookingId && item.customerId === customerId)

    if (!booking) {
      const error = new Error('Booking not found for complaint.')
      error.statusCode = 404
      throw error
    }

    const complaint = {
      id: createId('cmp'),
      bookingId: booking.id,
      customerId,
      workerId: booking.workerId,
      reason: payload.reason,
      status: 'Open',
      refundStatus: payload.requestedRefund ? 'Under review' : 'Not requested',
      requestedRefund: Number(payload.requestedRefund || 0),
      createdAt: new Date().toISOString(),
    }

    database.complaints.unshift(complaint)
    return complaint
  })
}
