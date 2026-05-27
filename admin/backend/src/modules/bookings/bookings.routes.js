import { Router } from 'express'
import {
  estimateBooking,
  patchCancel,
  patchReschedule,
  postBooking,
  postBookingMessage,
  postRepeatBooking,
} from '../../controllers/booking.controller.js'
import { requireRole } from '../../middlewares/rbac.js'
import { asyncHandler } from '../../utils/http.js'

export const bookingRoutes = Router()

bookingRoutes.use(requireRole('customer'))
bookingRoutes.post('/', asyncHandler(postBooking))
bookingRoutes.post('/estimate', asyncHandler(estimateBooking))
bookingRoutes.post('/:bookingId/repeat', asyncHandler(postRepeatBooking))
bookingRoutes.patch('/:bookingId/reschedule', asyncHandler(patchReschedule))
bookingRoutes.patch('/:bookingId/cancel', asyncHandler(patchCancel))
bookingRoutes.post('/:bookingId/messages', asyncHandler(postBookingMessage))
