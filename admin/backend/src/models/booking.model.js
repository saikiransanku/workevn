import mongoose from 'mongoose'

const lineItemSchema = new mongoose.Schema(
  {
    label: String,
    amount: Number,
  },
  { _id: false },
)

const bookingSchema = new mongoose.Schema(
  {
    invoiceNumber: String,
    customerId: { type: String, required: true, index: true },
    workerId: { type: String, index: true },
    serviceId: { type: String, required: true, index: true },
    serviceName: String,
    issue: String,
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Accepted', 'On the way', 'In progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    slot: String,
    address: String,
    estimateTotal: Number,
    finalTotal: Number,
    platformFee: Number,
    workerPayout: Number,
    paymentStatus: String,
    paymentMode: String,
    warrantyDays: Number,
    lineItems: [lineItemSchema],
    tracking: mongoose.Schema.Types.Mixed,
    summary: String,
  },
  { timestamps: true },
)

export const BookingModel = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)
export { bookingSchema }
