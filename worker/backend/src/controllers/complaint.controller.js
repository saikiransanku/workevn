import { createComplaint } from '../services/complaint.service.js'
import { CUSTOMER_ID } from '../services/customer.service.js'
import { requireFields } from '../validators/request.js'

export async function postComplaint(request, response) {
  requireFields(request.body, ['bookingId', 'reason'])
  response.status(201).json(await createComplaint(request.user?.sub || CUSTOMER_ID, request.body))
}
