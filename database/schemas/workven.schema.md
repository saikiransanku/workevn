# Workven Database Models

The backend includes MongoDB/Mongoose-ready models in `backend/models`.

## User

Fields: `role`, `name`, `phone`, `email`, `photoUrl`, `favoriteWorkerIds`, `preferences`.

Rules:

- Phone and email are immutable profile identifiers.
- Customers can edit name, photo, addresses and preferences only.

## Worker

Fields: `userId`, `skillCategories`, `primarySkill`, `education`, `experience`, `previousWork`, `rating`, `completedJobs`, `responseTimeMins`, `completionRate`, `availability`, `status`, `location`, `verification`, `ratingScore`, `badges`.

Verification layers:

- `verification.education`
- `verification.experience`
- `verification.previousWork`

Each layer has `status`, `score`, `reviewedBy`, `reviewedAt` and `notes`.

## Booking

Fields: `invoiceNumber`, `customerId`, `workerId`, `serviceId`, `serviceName`, `issue`, `status`, `slot`, `address`, `estimateTotal`, `finalTotal`, `platformFee`, `workerPayout`, `paymentStatus`, `paymentMode`, `warrantyDays`, `lineItems`, `tracking`, `summary`.

## Location

Fields: `userId`, `label`, `address`, `city`, `lat`, `lng`, `isDefault`.

## Payment

Fields: `bookingId`, `amount`, `status`, `method`, `capturedAt`, `refundStatus`.

## Complaint

Fields: `bookingId`, `customerId`, `workerId`, `reason`, `status`, `refundStatus`, `requestedRefund`, `resolutionNote`.

## Review

Fields: `bookingId`, `customerId`, `workerId`, `rating`, `feedback`.

## Notification

Fields: `userId`, `title`, `body`, `read`.

## Support Ticket

Fields: `customerId`, `subject`, `status`, `priority`, `owner`.
