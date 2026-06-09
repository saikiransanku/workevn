# Workevn API

Combined Node + Express + MongoDB backend for:

- `workevn-customer-ui`
- `workevn-worker-ui`
- `workevn-admin-ui`

## Setup

```bash
cd workevn-api
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

The API runs on `http://localhost:5000` by default.

## Main Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Customers:

- `GET /api/workers/nearby?lng=77.5946&lat=12.9716&radiusKm=10&skill=plumber`
- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/users/dashboard`

Workers:

- `POST /api/workers/apply`
- `GET /api/workers/dashboard`
- `PATCH /api/workers/availability`
- `PATCH /api/bookings/:id/accept`
- `PATCH /api/bookings/:id/reject`

Admin:

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/workers/applications`
- `PATCH /api/admin/workers/applications/:id/review`
- `GET /api/admin/bookings`

Use `Authorization: Bearer <token>` for protected routes.

## Worker Skills

Use these skill values in API requests:

- `ac_repair`
- `electrician`
- `plumber`
- `fan_repair`
- `appliance_repair`
- `carpenter`
