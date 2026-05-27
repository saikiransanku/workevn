# Workven

Workven is a trust-first service booking platform for verified home-service workers. It includes separate customer, worker and admin frontends plus a modular Node/Express API.

## Stack

- Frontend: React, JavaScript, HTML, Tailwind CSS, Vite
- Backend: Node.js, Express.js, Socket.io
- Database: file-backed development adapter plus MongoDB/Mongoose-ready models
- Auth: OTP challenge flow with JWT tokens
- Location: saved/current/manual/map-pin-ready location model

## Structure

```text
customer/
  frontend/
    public/
    src/
      assets/
      components/
      pages/
      layouts/
      hooks/
      context/
      services/
      utils/
      styles/
      main.jsx
    index.html
  backend/
    src/
      config/
      controllers/
      routes/
      models/
      middlewares/
      services/
      validators/
      utils/
      sockets/
      uploads/
      server.js
    .env

worker/
  frontend/
    public/
    src/
      assets/
      components/
      pages/
      layouts/
      hooks/
      context/
      services/
      utils/
      styles/
      main.jsx
    partner.html
  backend/
    src/
      config/
      controllers/
      routes/
      models/
      middlewares/
      services/
      validators/
      utils/
      sockets/
      uploads/
      server.js
    .env

admin/
  frontend/
    public/
    src/
      assets/
      components/
      pages/
      layouts/
      hooks/
      context/
      services/
      utils/
      styles/
      main.jsx
    admin.html
  backend/
    src/
      config/
      controllers/
      routes/
      models/
      middlewares/
      services/
      validators/
      utils/
      sockets/
      uploads/
      server.js
    .env

shared/
  components/
  constants/
  hooks/
  services/
  theme/
  utils/

README.md
```

Legacy `apps/` and root `src/` files have been removed. The active Vite entry files now live at `customer/frontend/index.html`, `worker/frontend/partner.html`, and `admin/frontend/admin.html`.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the API:

```bash
npm run dev:backend
```

Start a frontend:

```bash
npm run dev:customer
npm run dev:partner
npm run dev:admin
```

The API runs at `http://localhost:4300/api`. Frontends default to that URL through `VITE_API_URL`.

## Production Features In Place

- Customer booking workflow with service search, location selection, ranked workers, estimate, confirmation, live tracking, history, invoices, complaints and profile edit rules.
- Worker dashboard with availability, job lanes, accept/reject, navigation action, completion proof and earnings.
- Admin dashboard with KPIs, worker verification, bookings, complaints/refunds, commission settings, fraud signals and support tickets.
- Worker trust score from education, experience and previous-work verification.
- Ranking score from trust layers, rating, distance, skill match and completion rate.
- RBAC middleware for customer, worker and admin surfaces.
- Loading skeletons, API errors and empty states.

## Verification

```bash
npm run lint
npm run build:customer
npm run build:partner
npm run build:admin
```

API smoke test:

```bash
Invoke-RestMethod -Uri http://localhost:4300/api/health
Invoke-RestMethod -Uri http://localhost:4300/api/customer/bootstrap -Headers @{ 'X-Workven-Role' = 'customer' }
Invoke-RestMethod -Uri http://localhost:4300/api/admin/dashboard -Headers @{ 'X-Workven-Role' = 'admin' }
```

## Docs

- API routes: `docs/api/routes.md`
- UI structure: `docs/ui/component-structure.md`
- Architecture: `docs/architecture/overview.md`
- Database models: `database/schemas/workven.schema.md`
