import jwt from "jsonwebtoken";

export function signToken(user, sessionId = null) {
  const payload = {
    id: user._id.toString(),
    role: user.role
  };

  if (sessionId) payload.sessionId = sessionId;

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}
