import { User } from "../models/User.js";
import { WorkerProfile } from "../models/WorkerProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

function authResponse(user) {
  return {
    token: signToken(user),
    user,
  };
}

export const register = asyncHandler(async (req, res) => {
  console.log("Registering user with data:", req.body);
  const { name, email, phone, password, role = "customer" } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, phone, passwordHash, role });

  if (role === "worker") {
    await WorkerProfile.create({
      user: user._id,
      skills: [],
      verificationStatus: "pending",
    });
  }

  res.status(201).json(authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json(authResponse(user));
});

export const me = asyncHandler(async (req, res) => {
  let workerProfile = null;

  if (req.user.role === "worker") {
    workerProfile = await WorkerProfile.findOne({ user: req.user._id });
  }

  res.json({ user: req.user, workerProfile });
});
