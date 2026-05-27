import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    workerId: { type: String, index: true },
    reason: { type: String, required: true },
    status: { type: String, default: 'Open' },
    refundStatus: { type: String, default: 'Not requested' },
    requestedRefund: { type: Number, default: 0 },
    resolutionNote: String,
  },
  { timestamps: true },
)

export const ComplaintModel = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema)
export { complaintSchema }
