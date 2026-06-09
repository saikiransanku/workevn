import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    skill: {
      type: String,
      required: true
    },
    scheduledFor: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "rejected",
        "cancelled",
        "in_progress",
        "completed"
      ],
      default: "requested"
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    workerResponseAt: Date,
    cancellationReason: String,
    rejectionReason: String,
    completedAt: Date
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ worker: 1, status: 1, createdAt: -1 });
bookingSchema.index({ location: "2dsphere" });

export const Booking = mongoose.model("Booking", bookingSchema);
