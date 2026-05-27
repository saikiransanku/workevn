import mongoose from 'mongoose'

const supportTicketSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, index: true },
    subject: String,
    status: { type: String, default: 'Open' },
    priority: { type: String, default: 'Medium' },
    owner: String,
  },
  { timestamps: true },
)

export const SupportTicketModel =
  mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema)
export { supportTicketSchema }
