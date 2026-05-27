import { readDatabase, updateDatabase } from '../db/fileDatabase.js'
import { getDistanceKm } from '../utils/distance.js'
import { createId } from '../utils/id.js'
import { buildEstimate } from './pricing.service.js'
import { rankWorkers } from './ranking.service.js'

export async function getServices() {
  return (await readDatabase()).services
}

export async function getWorkerSuggestions({ serviceId, locationId }) {
  const database = await readDatabase()
  const service = database.services.find((item) => item.id === serviceId) || database.services[0]
  const customerLocation =
    database.locations.find((item) => item.id === locationId) ||
    database.locations.find((item) => item.isDefault) ||
    database.locations[0]

  const rankedWorkers = rankWorkers(
    database.workers,
    service,
    customerLocation,
    database.settings.rankingWeights,
  )

  return {
    service,
    location: customerLocation,
    groups: [
      {
        title: 'Best verified match',
        workers: rankedWorkers.filter((worker) => worker.rankGroup === 'Best verified match'),
      },
      {
        title: 'Middle-ranked workers',
        workers: rankedWorkers.filter((worker) => worker.rankGroup === 'Middle-ranked workers'),
      },
      {
        title: 'Other available workers',
        workers: rankedWorkers.filter((worker) => worker.rankGroup === 'Other available workers'),
      },
    ],
  }
}

export async function previewBookingEstimate({ serviceId, locationId, workerId, slot, emergency }) {
  const database = await readDatabase()
  const service = database.services.find((item) => item.id === serviceId)
  const location = database.locations.find((item) => item.id === locationId)
  const worker = database.workers.find((item) => item.id === workerId)

  if (!service) {
    const error = new Error('Service not found.')
    error.statusCode = 404
    throw error
  }

  return buildEstimate({
    service,
    slot,
    emergency,
    distanceKm: worker && location ? getDistanceKm(location, worker.location) : 3,
  })
}

export async function createBooking(customerId, payload) {
  return updateDatabase((database) => {
    const service = database.services.find((item) => item.id === payload.serviceId)
    const location = database.locations.find((item) => item.id === payload.locationId)
    const worker = database.workers.find((item) => item.id === payload.workerId)

    if (!service || !location || !worker) {
      const error = new Error('Service, location and worker are required for booking.')
      error.statusCode = 400
      throw error
    }

    const estimate = buildEstimate({
      service,
      slot: payload.slot,
      emergency: payload.emergency,
      distanceKm: getDistanceKm(location, worker.location),
    })
    const booking = {
      id: createId('bkg'),
      invoiceNumber: `INV-WV-${Date.now().toString().slice(-5)}`,
      customerId,
      workerId: worker.id,
      serviceId: service.id,
      serviceName: service.name,
      issue: payload.issue,
      status: 'Scheduled',
      slot: payload.slot,
      address: location.address,
      estimateTotal: estimate.total,
      finalTotal: null,
      platformFee: 0,
      workerPayout: 0,
      paymentStatus: 'Pending',
      paymentMode: payload.paymentMode || 'Cash after service',
      warrantyDays: service.warrantyDays,
      lineItems: estimate.lineItems,
      tracking: { progress: 20, currentStep: 'Worker assigned' },
      summary: payload.notes || 'Booking confirmed.',
      createdAt: new Date().toISOString(),
    }

    database.bookings.unshift(booking)
    database.workerRequests.unshift({
      id: createId('job'),
      serviceId: service.id,
      serviceName: service.name,
      issue: payload.issue,
      customerId,
      customerName: database.users.find((user) => user.id === customerId)?.name || 'Customer',
      workerId: worker.id,
      address: location.address,
      distanceKm: getDistanceKm(location, worker.location),
      slot: payload.slot,
      status: 'New request',
      difficulty: payload.emergency ? 'Emergency' : 'Standard',
      estimateTotal: estimate.total,
      paymentMode: booking.paymentMode,
      proofPhotos: [],
    })

    return booking
  })
}

export async function rescheduleBooking(customerId, bookingId, slot) {
  return updateDatabase((database) => {
    const booking = database.bookings.find((item) => item.id === bookingId && item.customerId === customerId)

    if (!booking) {
      const error = new Error('Booking not found.')
      error.statusCode = 404
      throw error
    }

    booking.slot = slot
    booking.status = 'Scheduled'
    booking.tracking = { progress: 20, currentStep: 'Rescheduled' }
    return booking
  })
}

export async function cancelBooking(customerId, bookingId, reason = 'Customer cancelled') {
  return updateDatabase((database) => {
    const booking = database.bookings.find((item) => item.id === bookingId && item.customerId === customerId)

    if (!booking) {
      const error = new Error('Booking not found.')
      error.statusCode = 404
      throw error
    }

    booking.status = 'Cancelled'
    booking.summary = reason
    booking.tracking = { progress: 0, currentStep: 'Cancelled' }
    return booking
  })
}

export async function addBookingMessage(customerId, bookingId, message) {
  return updateDatabase((database) => {
    const booking = database.bookings.find((item) => item.id === bookingId && item.customerId === customerId)

    if (!booking) {
      const error = new Error('Booking not found.')
      error.statusCode = 404
      throw error
    }

    booking.messages = [
      ...(booking.messages || []),
      { id: createId('msg'), senderId: customerId, body: message, createdAt: new Date().toISOString() },
    ]
    return booking
  })
}

export async function repeatBooking(customerId, bookingId) {
  const database = await readDatabase()
  const booking = database.bookings.find((item) => item.id === bookingId && item.customerId === customerId)
  const location = database.locations.find((item) => item.address === booking?.address) || database.locations[0]

  if (!booking) {
    const error = new Error('Booking not found.')
    error.statusCode = 404
    throw error
  }

  return createBooking(customerId, {
    serviceId: booking.serviceId,
    workerId: booking.workerId,
    locationId: location.id,
    issue: booking.issue,
    slot: 'Tomorrow, 10:30 AM',
    paymentMode: booking.paymentMode,
    notes: 'Repeated from previous booking.',
  })
}
