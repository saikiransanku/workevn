import { Booking } from "../models/Booking.js";
import { WorkerProfile } from "../models/WorkerProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBooking = asyncHandler(async (req, res) => {
  const { workerId, skill, scheduledFor, address, location, notes } = req.body;
  const workerProfile = await WorkerProfile.findOne({
    user: workerId,
    verificationStatus: "approved",
    isAvailable: true,
    skills: skill
  });

  if (!workerProfile) {
    throw new ApiError(404, "Worker is not available for this skill");
  }

  const booking = await Booking.create({
    customer: req.user._id,
    worker: workerId,
    skill,
    scheduledFor,
    address,
    location,
    notes
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate("customer", "name phone")
    .populate("worker", "name phone");

  res.status(201).json({ booking: populatedBooking });
});

export const listMyBookings = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "worker"
      ? { worker: req.user._id }
      : { customer: req.user._id };

  const bookings = await Booking.find(filter)
    .populate("customer", "name phone")
    .populate("worker", "name phone")
    .sort({ createdAt: -1 });

  res.json({ bookings });
});

export const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    worker: req.user._id,
    status: "requested"
  });

  if (!booking) {
    throw new ApiError(404, "Pending booking was not found");
  }

  booking.status = "accepted";
  booking.workerResponseAt = new Date();
  await booking.save();

  res.json({ booking });
});

export const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    worker: req.user._id,
    status: "requested"
  });

  if (!booking) {
    throw new ApiError(404, "Pending booking was not found");
  }

  booking.status = "rejected";
  booking.rejectionReason = req.body.reason;
  booking.workerResponseAt = new Date();
  await booking.save();

  res.json({ booking });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const allowedStatuses = ["cancelled", "in_progress", "completed"];
  const { status, reason } = req.body;

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(422, "Invalid booking status");
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const isCustomer = booking.customer.toString() === req.user._id.toString();
  const isWorker = booking.worker.toString() === req.user._id.toString();

  if (!isCustomer && !isWorker && req.user.role !== "admin") {
    throw new ApiError(403, "You cannot update this booking");
  }

  if (status === "cancelled" && !isCustomer && req.user.role !== "admin") {
    throw new ApiError(403, "Only customers or admins can cancel bookings");
  }

  booking.status = status;
  booking.cancellationReason = status === "cancelled" ? reason : booking.cancellationReason;
  booking.completedAt = status === "completed" ? new Date() : booking.completedAt;
  await booking.save();

  res.json({ booking });
});
