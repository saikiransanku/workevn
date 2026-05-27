# API Smoke Contract

Manual smoke checks used during implementation:

```bash
node backend/server.js
Invoke-RestMethod -Uri http://localhost:4300/api/health
Invoke-RestMethod -Uri http://localhost:4300/api/customer/bootstrap -Headers @{ 'X-Workven-Role' = 'customer' }
Invoke-RestMethod -Uri http://localhost:4300/api/admin/dashboard -Headers @{ 'X-Workven-Role' = 'admin' }
```

Expected:

- Health returns `ok: true`.
- Customer bootstrap returns profile, services, locations, bookings, complaints, notifications and favorite workers.
- Admin dashboard returns summary, workers, bookings, complaints, support tickets, settings and fraud signals.
