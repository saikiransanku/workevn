import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, index: true },
    amount: Number,
    status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    method: String,
    capturedAt: Date,
    refundStatus: String,
  },
  { timestamps: true },
)

export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)
export { paymentSchema }
