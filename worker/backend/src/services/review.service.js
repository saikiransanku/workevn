import { updateDatabase } from '../db/fileDatabase.js'
import { createId } from '../utils/id.js'

export async function createReview(customerId, payload) {
  return updateDatabase((database) => {
    const booking = database.bookings.find((item) => item.id === payload.bookingId && item.customerId === customerId)

    if (!booking || booking.status !== 'Completed') {
      const error = new Error('Only completed bookings can be reviewed.')
      error.statusCode = 400
      throw error
    }

    const review = {
      id: createId('rev'),
      bookingId: booking.id,
      customerId,
      workerId: booking.workerId,
      rating: Number(payload.rating),
      feedback: payload.feedback || '',
      createdAt: new Date().toISOString(),
    }

    database.reviews.unshift(review)
    return review
  })
}
