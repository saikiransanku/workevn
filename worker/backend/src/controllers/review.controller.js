import { CUSTOMER_ID } from '../services/customer.service.js'
import { createReview } from '../services/review.service.js'
import { requireFields } from '../validators/request.js'

export async function postReview(request, response) {
  requireFields(request.body, ['bookingId', 'rating'])
  response.status(201).json(await createReview(request.user?.sub || CUSTOMER_ID, request.body))
}
