import mongoose from 'mongoose'

const verificationLayerSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    score: { type: Number, min: 0, max: 100, default: 0 },
    reviewedBy: String,
    reviewedAt: Date,
    notes: String,
  },
  { _id: false },
)

const workerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    photoUrl: String,
    skillCategories: [String],
    primarySkill: String,
    education: String,
    experience: String,
    previousWork: String,
    rating: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    responseTimeMins: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    availability: { type: String, default: 'Unavailable' },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected', 'suspended'],
      default: 'pending_review',
    },
    location: {
      lat: Number,
      lng: Number,
      locality: String,
    },
    verification: {
      education: verificationLayerSchema,
      experience: verificationLayerSchema,
      previousWork: verificationLayerSchema,
    },
    ratingScore: { type: Number, min: 0, max: 100, default: 0 },
    badges: [String],
  },
  { timestamps: true },
)

export const WorkerModel = mongoose.models.Worker || mongoose.model('Worker', workerSchema)
export { workerSchema }
