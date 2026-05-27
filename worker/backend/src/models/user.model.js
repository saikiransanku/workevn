import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['customer', 'worker', 'admin'], required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, immutable: true },
    email: { type: String, required: true, immutable: true },
    photoUrl: String,
    favoriteWorkerIds: [String],
    preferences: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
)

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema)
export { userSchema }
