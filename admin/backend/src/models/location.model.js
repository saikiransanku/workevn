import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    label: String,
    address: { type: String, required: true },
    city: String,
    lat: Number,
    lng: Number,
    isDefault: Boolean,
  },
  { timestamps: true },
)

export const LocationModel = mongoose.models.Location || mongoose.model('Location', locationSchema)
export { locationSchema }
