import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  const bookingsCount = await Booking.countDocuments({ customer: req.user._id });
  res.json({ user: req.user, stats: { bookingsCount } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "avatarUrl", "address", "location"];
  const update = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      update[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true
  });

  res.json({ user });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const recentBookings = await Booking.find({ customer: req.user._id })
    .populate("worker", "name phone")
    .sort({ createdAt: -1 })
    .limit(10);

  const stats = {
    totalBookings: await Booking.countDocuments({ customer: req.user._id }),
    activeBookings: await Booking.countDocuments({
      customer: req.user._id,
      status: { $in: ["requested", "accepted", "in_progress"] }
    }),
    completedBookings: await Booking.countDocuments({
      customer: req.user._id,
      status: "completed"
    })
  };

  res.json({ stats, recentBookings });
});
