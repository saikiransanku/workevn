# Frontend Component Structure

## Customer

- `components/location/LocationSelector.jsx`: saved addresses, current location entry point, map-pin ready state.
- `components/services/ServiceGrid.jsx`: primary services and smart search.
- `components/booking/BookingPanel.jsx`: issue, time slot, emergency, estimate and confirmation.
- `components/profile/ProfilePanel.jsx`: editable profile fields while phone/email stay locked.
- `pages/CustomerHome.jsx`: orchestrates worker suggestions, favorite workers, live tracking, history, invoices and complaints.

## Worker

- `components/profile/WorkerProfileCard.jsx`: photo, skills, education, experience, previous work, rating and availability.
- `components/verification/VerificationCard.jsx`: education, experience and previous-work verification layers.
- `components/jobs/JobBoard.jsx`: new requests, accepted jobs, on-the-way jobs and completed jobs.
- `pages/WorkerDashboard.jsx`: earnings, proof upload actions and navigation actions.

## Admin

- `components/workers/VerificationQueue.jsx`: approve/reject worker profiles.
- `components/bookings/BookingTable.jsx`: booking operations overview.
- `components/complaints/ComplaintDesk.jsx`: complaint/refund resolution.
- `components/settings/CommissionSettings.jsx`: commission and emergency fee settings.
- `pages/AdminDashboard.jsx`: KPIs, fraud signals, support tickets and management panels.

## Shared

- `components/AppShell.jsx`
- `components/WorkerCard.jsx`
- `components/MetricCard.jsx`
- `components/StatusBadge.jsx`
- `components/Skeleton.jsx`
- `components/EmptyState.jsx`
- `services/apiClient.js`
- `hooks/useApiResource.js`
- `theme/theme.css`
