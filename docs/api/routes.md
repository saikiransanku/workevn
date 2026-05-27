# Workven API Routes

Base URL: `http://localhost:4300/api`

## Auth

- `POST /auth/otp/request`
- `POST /auth/otp/verify`

## Customer

- `GET /customer/bootstrap`
- `PATCH /customer/profile`
- `POST /customer/locations`
- `PATCH /customer/workers/:workerId/favorite`

## Services And Workers

- `GET /services`
- `GET /workers/suggestions?serviceId=&locationId=`

## Bookings

- `POST /bookings/estimate`
- `POST /bookings`
- `POST /bookings/:bookingId/repeat`
- `PATCH /bookings/:bookingId/reschedule`
- `PATCH /bookings/:bookingId/cancel`
- `POST /bookings/:bookingId/messages`

## Worker

- `GET /worker/bootstrap`
- `PATCH /worker/availability`
- `PATCH /worker/jobs/:jobId/status`
- `POST /worker/jobs/:jobId/proof`

## Admin

- `GET /admin/dashboard`
- `PATCH /admin/workers/:workerId/verification`
- `PATCH /admin/complaints/:complaintId`
- `PATCH /admin/settings`

## Support

- `POST /complaints`
- `POST /reviews`
- `GET /payments/health`
- `GET /notifications/health`
