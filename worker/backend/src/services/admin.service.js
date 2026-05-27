import { readDatabase, updateDatabase } from '../db/fileDatabase.js'
import { calculateTrustScore } from './ranking.service.js'

function sumBookings(bookings, field) {
  return bookings.reduce((sum, booking) => sum + Number(booking[field] || 0), 0)
}

export async function getAdminDashboard() {
  const database = await readDatabase()
  const completedBookings = database.bookings.filter((booking) => booking.status === 'Completed')
  const activeWorkers = database.workers.filter((worker) => worker.availability !== 'Unavailable')
  const openComplaints = database.complaints.filter((complaint) => complaint.status !== 'Resolved')

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalBookings: database.bookings.length,
      revenue: sumBookings(completedBookings, 'finalTotal'),
      cancellations: database.bookings.filter((booking) => booking.status === 'Cancelled').length,
      activeWorkers: activeWorkers.length,
      pendingVerification: database.workers.filter((worker) => worker.status === 'pending_review').length,
      openComplaints: openComplaints.length,
      refundsInReview: database.complaints.filter((complaint) => complaint.refundStatus === 'Under review').length,
    },
    bookings: database.bookings,
    workers: database.workers.map((worker) => ({
      ...worker,
      trustScore: calculateTrustScore(worker),
    })),
    complaints: database.complaints,
    supportTickets: database.supportTickets,
    settings: database.settings,
    fraudSignals: database.bookings
      .filter((booking) => booking.status === 'Cancelled' || booking.paymentStatus === 'Failed')
      .map((booking) => ({
        id: booking.id,
        label: `${booking.serviceName} needs review`,
        reason: booking.status === 'Cancelled' ? 'Cancellation pattern' : 'Payment issue',
      })),
  }
}

export async function decideWorkerVerification(workerId, decision, notes = '') {
  return updateDatabase((database) => {
    const worker = database.workers.find((item) => item.id === workerId)

    if (!worker) {
      const error = new Error('Worker not found.')
      error.statusCode = 404
      throw error
    }

    worker.status = decision === 'approve' ? 'approved' : 'rejected'
    worker.verification.previousWork.notes = notes
    worker.reviewedAt = new Date().toISOString()
    return worker
  })
}

export async function updateComplaintStatus(complaintId, payload) {
  return updateDatabase((database) => {
    const complaint = database.complaints.find((item) => item.id === complaintId)

    if (!complaint) {
      const error = new Error('Complaint not found.')
      error.statusCode = 404
      throw error
    }

    complaint.status = payload.status || complaint.status
    complaint.refundStatus = payload.refundStatus || complaint.refundStatus
    complaint.resolutionNote = payload.resolutionNote || complaint.resolutionNote
    return complaint
  })
}

export async function updateCommissionSettings(settings) {
  return updateDatabase((database) => {
    database.settings = {
      ...database.settings,
      ...settings,
    }

    return database.settings
  })
}
