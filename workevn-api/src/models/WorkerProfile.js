import mongoose from "mongoose";

export const WORKER_SKILLS = [
  "ac_repair",
  "electrician",
  "plumber",
  "fan_repair",
  "appliance_repair",
  "carpenter"
];

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["aadhaar", "pan", "license", "certificate", "photo", "other"],
      required: true
    },
    number: String,
    url: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const workerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    skills: [
      {
        type: String,
        enum: WORKER_SKILLS,
        required: true
      }
    ],
    experienceYears: {
      type: Number,
      min: 0,
      default: 0
    },
    serviceRadiusKm: {
      type: Number,
      min: 1,
      max: 100,
      default: 10
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    documents: [documentSchema],
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending"
    },
    rejectionReason: String,
    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: Date
  },
  { timestamps: true }
);

workerProfileSchema.index({ skills: 1, verificationStatus: 1, isAvailable: 1 });

export const WorkerProfile = mongoose.model("WorkerProfile", workerProfileSchema);
