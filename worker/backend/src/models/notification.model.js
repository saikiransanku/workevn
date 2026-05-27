import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: String,
    body: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const NotificationModel =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
export { notificationSchema }
