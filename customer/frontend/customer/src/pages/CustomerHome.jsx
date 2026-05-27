import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../../../shared/components/AppShell.jsx'
import { EmptyState } from '../../../shared/components/EmptyState.jsx'
import { MetricCard } from '../../../shared/components/MetricCard.jsx'
import { SkeletonGrid } from '../../../shared/components/Skeleton.jsx'
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx'
import { WorkerCard } from '../../../shared/components/WorkerCard.jsx'
import { useApiResource } from '../../../shared/hooks/useApiResource.js'
import { formatCurrency } from '../../../shared/utils/formatters.js'
import { BookingPanel } from '../components/booking/BookingPanel.jsx'
import { LocationSelector } from '../components/location/LocationSelector.jsx'
import { ProfilePanel } from '../components/profile/ProfilePanel.jsx'
import { ServiceGrid } from '../components/services/ServiceGrid.jsx'
import { customerApi } from '../services/customerApi.js'

export function CustomerHome() {
  const { data, loading, error, reload } = useApiResource(customerApi.bootstrap)
  const [serviceQuery, setServiceQuery] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [workerGroups, setWorkerGroups] = useState([])
  const [workerError, setWorkerError] = useState('')
  const [issue, setIssue] = useState('')
  const [slot, setSlot] = useState('Within 45 minutes')
  const [emergency, setEmergency] = useState(false)
  const [estimate, setEstimate] = useState(null)
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')

  const activeServiceId = selectedServiceId || data?.services?.[0]?.id || ''
  const activeLocationId =
    selectedLocationId ||
    data?.locations?.find((item) => item.isDefault)?.id ||
    data?.locations?.[0]?.id ||
    ''
  const selectedService = useMemo(
    () => data?.services?.find((service) => service.id === activeServiceId),
    [data?.services, activeServiceId],
  )
  const activeIssue = issue || selectedService?.issues?.[0] || ''

  useEffect(() => {
    if (!activeServiceId || !activeLocationId) return

    customerApi
      .workerSuggestions(activeServiceId, activeLocationId)
      .then((result) => {
        setWorkerGroups(result.groups)
        setWorkerError('')
      })
      .catch((fetchError) => {
        setWorkerGroups([])
        setWorkerError(fetchError.message)
      })
  }, [activeServiceId, activeLocationId])

  useEffect(() => {
    if (!activeServiceId || !selectedWorker) return

    customerApi
      .estimate({
        serviceId: activeServiceId,
        locationId: activeLocationId,
        workerId: selectedWorker.id,
        slot,
        emergency,
      })
      .then(setEstimate)
      .catch(() => setEstimate(null))
  }, [activeServiceId, activeLocationId, selectedWorker, slot, emergency])

  async function handleConfirmBooking() {
    setCreating(true)
    setNotice('')

    try {
      const booking = await customerApi.createBooking({
        serviceId: activeServiceId,
        workerId: selectedWorker.id,
        locationId: activeLocationId,
        issue: activeIssue,
        slot,
        emergency,
        paymentMode: 'Cash after service',
      })
      setNotice(`Booking ${booking.invoiceNumber} confirmed with ${selectedWorker.name}.`)
      await reload()
    } catch (confirmError) {
      setNotice(confirmError.message)
    } finally {
      setCreating(false)
    }
  }

  async function refreshAfter(action) {
    await action()
    await reload()
  }

  function handleServiceSelect(serviceId) {
    setSelectedServiceId(serviceId)
    setIssue('')
    setSelectedWorker(null)
    setEstimate(null)
  }

  function handleWorkerSelect(worker) {
    setSelectedWorker(worker)
    setEstimate(null)
  }

  if (loading) {
    return (
      <AppShell eyebrow="Customer app" title="Workevn" subtitle="Loading your trusted service marketplace.">
        <SkeletonGrid count={8} />
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell eyebrow="Customer app" title="Workevn" subtitle="The frontend is ready, but the API is not reachable.">
        <EmptyState title="Start the Workven API" body={error} />
      </AppShell>
    )
  }

  const favoriteWorkerIds = data.favoriteWorkerIds || []
  const activeBooking = data.bookings?.find(
    (booking) => booking.status !== 'Completed' && booking.status !== 'Cancelled',
  )

  return (
    <AppShell
      eyebrow="Customer app"
      title="Workevn"
      subtitle="Book verified home-service workers by trust score, skill match, distance, rating and previous work."
      actions={<StatusBadge tone="success">API-driven</StatusBadge>}
    >
      {notice ? (
        <div className="rounded-lg border border-[#0f766e]/20 bg-[#0f766e]/10 p-3 text-sm font-bold text-[#115e59]">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Saved addresses" value={data.locations.length} detail="Home, office and map-pin ready" />
        <MetricCard label="Bookings" value={data.bookings.length} detail="History, invoice and repeat flow" />
        <MetricCard label="Favorites" value={favoriteWorkerIds.length} detail="Saved workers for faster booking" />
        <MetricCard label="Open complaints" value={data.complaints.length} detail="Refund status tracked" />
      </section>

      <LocationSelector
        locations={data.locations}
        selectedLocationId={activeLocationId}
        onSelect={setSelectedLocationId}
        onDetectCurrent={() => setNotice('Current-location detection is ready for Google Maps or Mapbox credentials.')}
      />

      <ServiceGrid
        services={data.services}
        selectedServiceId={activeServiceId}
        query={serviceQuery}
        onQuery={setServiceQuery}
        onSelect={handleServiceSelect}
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Worker ranking</p>
            <h2 className="font-display text-xl font-extrabold">Suggested workers</h2>
            {workerError ? <EmptyState title="Worker suggestions unavailable" body={workerError} /> : null}
            <div className="mt-4 grid gap-4">
              {workerGroups.map((group) =>
                group.workers.length ? (
                  <div key={group.title}>
                    <h3 className="mb-3 font-display text-lg font-extrabold">{group.title}</h3>
                    <div className="grid gap-3">
                      {group.workers.map((worker) => (
                        <WorkerCard
                          key={worker.id}
                          worker={worker}
                          selected={selectedWorker?.id === worker.id}
                          favorite={favoriteWorkerIds.includes(worker.id)}
                          onSelect={handleWorkerSelect}
                          onFavorite={(item) => refreshAfter(() => customerApi.toggleFavorite(item.id))}
                        />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
              {!workerGroups.some((group) => group.workers.length) && !workerError ? (
                <EmptyState title="No verified workers found" body="Try another service or location." />
              ) : null}
            </div>
          </section>
        </div>

        <div className="grid content-start gap-4">
          <BookingPanel
            service={selectedService}
            selectedWorker={selectedWorker}
            issue={activeIssue}
            onIssue={setIssue}
            slot={slot}
            onSlot={setSlot}
            emergency={emergency}
            onEmergency={setEmergency}
            estimate={estimate}
            creating={creating}
            onConfirm={handleConfirmBooking}
          />

          {activeBooking ? (
            <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">Live tracking</p>
                  <h2 className="font-display text-xl font-extrabold">{activeBooking.serviceName}</h2>
                  <p className="text-sm text-[#66736d]">{activeBooking.summary}</p>
                </div>
                <StatusBadge tone="info">{activeBooking.status}</StatusBadge>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#dfe6e2]">
                <div
                  className="h-full rounded-full bg-[#0f766e]"
                  style={{ width: `${activeBooking.tracking?.progress || 20}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-bold text-[#44524c]">{activeBooking.tracking?.currentStep}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-lg border border-[#cbd7d1] px-3 py-2 text-sm font-extrabold"
                  onClick={() => refreshAfter(() => customerApi.rescheduleBooking(activeBooking.id, 'Tomorrow, 10:30 AM'))}
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-extrabold text-red-700"
                  onClick={() => refreshAfter(() => customerApi.cancelBooking(activeBooking.id, 'Cancelled by customer'))}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#cbd7d1] px-3 py-2 text-sm font-extrabold"
                  onClick={() => refreshAfter(() => customerApi.sendMessage(activeBooking.id, 'Please call before arriving.'))}
                >
                  Chat worker
                </button>
                <button type="button" className="rounded-lg bg-[#17201d] px-3 py-2 text-sm font-extrabold text-white">
                  Call worker
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe6e2] bg-white p-4 soft-shadow">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f766e]">History and invoices</p>
        <h2 className="font-display text-xl font-extrabold">Service history</h2>
        <div className="mt-4 grid gap-3">
          {data.bookings.map((booking) => (
            <article key={booking.id} className="rounded-lg border border-[#dfe6e2] bg-[#f8faf9] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-extrabold">{booking.serviceName}</h3>
                  <p className="text-sm text-[#66736d]">
                    {booking.issue} at {booking.address}
                  </p>
                </div>
                <StatusBadge tone={booking.status === 'Completed' ? 'success' : 'info'}>{booking.status}</StatusBadge>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-[#44524c]">
                <span>{booking.invoiceNumber}</span>
                <span>{formatCurrency(booking.finalTotal || booking.estimateTotal)}</span>
                <span>{booking.paymentStatus}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[#cbd7d1] px-3 py-2 text-sm font-extrabold"
                  onClick={() => refreshAfter(() => customerApi.repeatBooking(booking.id))}
                >
                  Repeat booking
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#cbd7d1] px-3 py-2 text-sm font-extrabold"
                  onClick={() =>
                    refreshAfter(() =>
                      customerApi.createComplaint({
                        bookingId: booking.id,
                        reason: 'Need support follow-up',
                        requestedRefund: 0,
                      }),
                    )
                  }
                >
                  Track complaint
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ProfilePanel profile={data.profile} onSave={(payload) => refreshAfter(() => customerApi.updateProfile(payload))} />
    </AppShell>
  )
}
