import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";
import { WorkerProfile } from "../models/WorkerProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const applyAsWorker = asyncHandler(async (req, res) => {
  const {
    skills,
    experienceYears,
    serviceRadiusKm,
    bio,
    documents,
    emergencyContact,
    location,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      role: "worker",
      location,
    },
    { new: true, runValidators: true },
  );

  const profile = await WorkerProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      skills,
      experienceYears,
      serviceRadiusKm,
      bio,
      documents,
      emergencyContact,
      verificationStatus: "approved",
      rejectionReason: undefined,
      isAvailable: true,
    },
    { new: true, upsert: true, runValidators: true },
  );

  res.status(201).json({ user, workerProfile: profile });
});

export const getWorkerProfile = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id }).populate(
    "user",
    "name email phone location address avatarUrl",
  );

  if (!profile) {
    throw new ApiError(404, "Worker profile not found");
  }

  res.json({ workerProfile: profile });
});

export const updateWorkerAvailability = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id });

  if (!profile) {
    throw new ApiError(404, "Worker profile not found");
  }

  if (profile.verificationStatus !== "approved") {
    throw new ApiError(
      403,
      "Worker must be approved before becoming available",
    );
  }

  profile.isAvailable = Boolean(req.body.isAvailable);
  await profile.save();

  res.json({ workerProfile: profile });
});

export const findNearbyWorkers = asyncHandler(async (req, res) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);
  const radiusKm = Number(req.query.radiusKm || 10);
  const skill = req.query.skill;

  const workerProfiles = await WorkerProfile.find({
    verificationStatus: "approved",
    isAvailable: true,
    ...(skill ? { skills: skill } : {}),
  }).select(
    "user skills experienceYears serviceRadiusKm ratingAverage ratingCount",
  );

  const workerIds = workerProfiles.map((profile) => profile.user);
  const users = await User.find({
    _id: { $in: workerIds },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000,
      },
    },
  }).select("name phone avatarUrl location address");

  const profileByUserId = new Map(
    workerProfiles.map((profile) => [profile.user.toString(), profile]),
  );

  const workers = users.map((user) => ({
    user,
    workerProfile: profileByUserId.get(user._id.toString()),
  }));

  res.json({ workers });
});
export const findAllWorkers = asyncHandler(async (req, res) => {
  const workerProfiles = await WorkerProfile.find({
    verificationStatus: "approved",
  }).select(
    "user skills experienceYears serviceRadiusKm ratingAverage ratingCount",
  );

  const workerIds = workerProfiles.map((profile) => profile.user);
  const users = await User.find({
    _id: { $in: workerIds },
  }).select("name phone avatarUrl location address");

  const profileByUserId = new Map(
    workerProfiles.map((profile) => [profile.user.toString(), profile]),
  );

  const workers = users.map((user) => ({
    user,
    workerProfile: profileByUserId.get(user._id.toString()),
  }));

  res.json({ workers });
});

export const getWorkerDashboard = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ worker: req.user._id })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 })
    .limit(20);

  const stats = {
    pendingRequests: await Booking.countDocuments({
      worker: req.user._id,
      status: "requested",
    }),
    activeJobs: await Booking.countDocuments({
      worker: req.user._id,
      status: { $in: ["accepted", "in_progress"] },
    }),
    completedJobs: await Booking.countDocuments({
      worker: req.user._id,
      status: "completed",
    }),
  };

  res.json({ stats, bookings });
});
