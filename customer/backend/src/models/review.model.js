import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    workerId: { type: String, required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: String,
  },
  { timestamps: true },
)

export const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema)
export { reviewSchema }
