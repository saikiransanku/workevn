import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authentication token is required");
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.id).select("+passwordHash");

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid authentication token");
  }

  req.user = user;
  next();
});

export function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
