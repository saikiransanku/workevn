import { User } from "../models/User.js";
import { WorkerProfile } from "../models/WorkerProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import crypto from "crypto";

function authResponse(user) {
  return {
    token: signToken(user),
    user
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

  // create a new session id and persist it so older tokens are invalidated
  const sessionId = crypto.randomBytes(16).toString("hex");
  user.currentSessionId = sessionId;
  await user.save();

  const token = signToken(user, sessionId);

  res.json({ token, user });
});

export const logout = asyncHandler(async (req, res) => {
  // clear session id for current user
  const user = req.user;
  if (user) {
    user.currentSessionId = null;
    await user.save();
  }
  res.json({ success: true });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select("+email");
  if (!user) return res.json({ success: true });

  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000); // 1 hour
  await user.save();

  // TODO: integrate email provider. For now, log token and return it in response for dev.
  console.log(`Password reset token for ${email}: ${token}`);

  res.json({ success: true, resetToken: token });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } }).select(
    "+passwordHash"
  );

  if (!user) throw new ApiError(400, "Invalid or expired password reset token");

  user.passwordHash = await User.hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // invalidate existing sessions
  user.currentSessionId = null;
  await user.save();

  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  let workerProfile = null;

  if (req.user.role === "worker") {
    workerProfile = await WorkerProfile.findOne({ user: req.user._id });
  }

  res.json({ user: req.user, workerProfile });
});
