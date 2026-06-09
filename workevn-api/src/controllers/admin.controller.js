import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import { WorkerProfile } from "../models/WorkerProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const stats = {
    users: await User.countDocuments({ role: "customer" }),
    workers: await User.countDocuments({ role: "worker" }),
    pendingWorkers: await WorkerProfile.countDocuments({ verificationStatus: "pending" }),
    bookings: await Booking.countDocuments(),
    activeBookings: await Booking.countDocuments({
      status: { $in: ["requested", "accepted", "in_progress"] }
    })
  };

  const recentBookings = await Booking.find()
    .populate("customer", "name phone")
    .populate("worker", "name phone")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ stats, recentBookings });
});

export const listUsers = asyncHandler(async (req, res) => {
  const role = req.query.role;
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users });
});

export const listWorkerApplications = asyncHandler(async (req, res) => {
  const status = req.query.status || "pending";
  const profiles = await WorkerProfile.find({ verificationStatus: status })
    .populate("user", "name email phone address location")
    .sort({ createdAt: -1 });

  res.json({ workerApplications: profiles });
});

export const reviewWorkerApplication = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected", "suspended"].includes(status)) {
    throw new ApiError(422, "Status must be approved, rejected, or suspended");
  }

  const profile = await WorkerProfile.findById(req.params.id);

  if (!profile) {
    throw new ApiError(404, "Worker application not found");
  }

  profile.verificationStatus = status;
  profile.rejectionReason = status === "rejected" ? rejectionReason : undefined;
  profile.reviewedBy = req.user._id;
  profile.reviewedAt = new Date();
  profile.isAvailable = status === "approved" ? profile.isAvailable : false;
  await profile.save();

  res.json({ workerProfile: profile });
});

export const listBookings = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const bookings = await Booking.find(filter)
    .populate("customer", "name phone")
    .populate("worker", "name phone")
    .sort({ createdAt: -1 });

  res.json({ bookings });
});
