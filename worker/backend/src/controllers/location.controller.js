import { CUSTOMER_ID } from '../services/customer.service.js'
import { addLocation } from '../services/location.service.js'
import { requireFields } from '../validators/request.js'

export async function postLocation(request, response) {
  requireFields(request.body, ['address'])
  response.status(201).json(await addLocation(request.user?.sub || CUSTOMER_ID, request.body))
}
