# Workven Architecture

Workven is split into three role frontends and one modular API backend:

- Customer frontend: `frontend/customer`
- Worker frontend: `frontend/worker`
- Admin frontend: `frontend/admin`
- Shared frontend system: `frontend/shared`
- API backend: `backend`
- Database seed, migrations and schema notes: `database`

## Product Flow

1. Customer opens the home page and selects a saved, current, manual or map-pin location.
2. Customer chooses one of the primary services: AC repair, electrical repair, plumbing, fan repair, appliance repair or carpenter.
3. Customer picks an issue and time slot.
4. API ranks workers by skill match, trust score, distance, rating and completion rate.
5. Customer reviews the estimate and confirms booking.
6. Worker receives the job request, accepts/rejects, navigates, uploads before/after proof and completes the job.
7. Customer tracks status, chats/calls, reschedules/cancels, pays, reviews and can repeat the booking.
8. Admin manages verification, refunds, complaints, performance, fraud signals and commission.

## Data Rule

Role frontends no longer import local dummy objects for their screens. They read through API endpoints with loading, empty and error states. The local file database is a development adapter seeded from `database/seed/workven.seed.js`; it can be replaced by MongoDB using the Mongoose models in `backend/models`.

## Realtime

Socket.io is initialized in `backend/server.js`. Booking rooms use `booking:{bookingId}` and worker rooms use `worker:{workerId}`. Booking mutations emit updates through `backend/sockets/realtime.js`.

## RBAC

Requests are authenticated in `backend/middlewares/auth.js`. Production clients should send JWT bearer tokens from `/api/auth/otp/verify`. Local development frontends send `X-Workven-Role` so role screens can run without a full OTP provider.

Role guards:

- `customer`: profile, locations, bookings, complaints, reviews, favorites
- `worker`: dashboard, availability, jobs, completion proof
- `admin`: dashboard, worker verification, complaints, settings

## Trust And Ranking

Worker trust is calculated from three verification layers:

- Education verification
- Work experience verification
- Previous work verification

Ranking adds rating, distance and completion rate. The API returns workers grouped as:

1. Best verified match
2. Middle-ranked workers
3. Other available workers
