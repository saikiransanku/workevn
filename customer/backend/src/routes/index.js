import { Router } from 'express'
import { adminRoutes } from '../modules/admin/admin.routes.js'
import { authRoutes } from '../modules/auth/auth.routes.js'
import { bookingRoutes } from '../modules/bookings/bookings.routes.js'
import { complaintRoutes } from '../modules/complaints/complaints.routes.js'
import { customerRoutes } from '../modules/customer/customer.routes.js'
import { locationRoutes } from '../modules/locations/locations.routes.js'
import { notificationRoutes } from '../modules/notifications/notifications.routes.js'
import { paymentRoutes } from '../modules/payments/payments.routes.js'
import { reviewRoutes } from '../modules/reviews/reviews.routes.js'
import { userRoutes } from '../modules/users/users.routes.js'
import { workerRoutes } from '../modules/worker/worker.routes.js'
import { workersRoutes } from '../modules/workers/workers.routes.js'
import { listServices } from '../controllers/booking.controller.js'
import { asyncHandler } from '../utils/http.js'

export const apiRoutes = Router()

apiRoutes.get('/health', (request, response) => {
  response.json({
    ok: true,
    service: 'workven-api',
    timestamp: new Date().toISOString(),
  })
})

apiRoutes.get('/services', asyncHandler(listServices))
apiRoutes.use('/auth', authRoutes)
apiRoutes.use('/customer', customerRoutes)
apiRoutes.use('/worker', workerRoutes)
apiRoutes.use('/admin', adminRoutes)
apiRoutes.use('/bookings', bookingRoutes)
apiRoutes.use('/workers', workersRoutes)
apiRoutes.use('/users', userRoutes)
apiRoutes.use('/locations', locationRoutes)
apiRoutes.use('/payments', paymentRoutes)
apiRoutes.use('/reviews', reviewRoutes)
apiRoutes.use('/notifications', notificationRoutes)
apiRoutes.use('/complaints', complaintRoutes)
