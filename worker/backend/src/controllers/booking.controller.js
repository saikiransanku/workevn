import {
  addBookingMessage,
  cancelBooking,
  createBooking,
  getServices,
  getWorkerSuggestions,
  previewBookingEstimate,
  repeatBooking,
  rescheduleBooking,
} from '../services/booking.service.js'
import { CUSTOMER_ID } from '../services/customer.service.js'
import { emitBookingUpdate } from '../sockets/realtime.js'
import { requireFields } from '../validators/request.js'

export async function listServices(request, response) {
  response.json(await getServices())
}

export async function suggestWorkers(request, response) {
  response.json(await getWorkerSuggestions(request.query))
}

export async function estimateBooking(request, response) {
  requireFields(request.body, ['serviceId'])
  response.json(await previewBookingEstimate(request.body))
}

export async function postBooking(request, response) {
  requireFields(request.body, ['serviceId', 'workerId', 'locationId', 'issue', 'slot'])
  const booking = await createBooking(request.user?.sub || CUSTOMER_ID, request.body)
  emitBookingUpdate(request, booking)
  response.status(201).json(booking)
}

export async function patchReschedule(request, response) {
  requireFields(request.body, ['slot'])
  const booking = await rescheduleBooking(
    request.user?.sub || CUSTOMER_ID,
    request.params.bookingId,
    request.body.slot,
  )
  emitBookingUpdate(request, booking)
  response.json(booking)
}

export async function patchCancel(request, response) {
  const booking = await cancelBooking(
    request.user?.sub || CUSTOMER_ID,
    request.params.bookingId,
    request.body.reason,
  )
  emitBookingUpdate(request, booking)
  response.json(booking)
}

export async function postBookingMessage(request, response) {
  requireFields(request.body, ['message'])
  response.json(
    await addBookingMessage(request.user?.sub || CUSTOMER_ID, request.params.bookingId, request.body.message),
  )
}

export async function postRepeatBooking(request, response) {
  response.status(201).json(await repeatBooking(request.user?.sub || CUSTOMER_ID, request.params.bookingId))
}
