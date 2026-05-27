import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { updateDatabase } from '../db/fileDatabase.js'
import { createId } from '../utils/id.js'

export async function createOtpChallenge({ phone, role = 'customer' }) {
  return updateDatabase((database) => {
    const otp = env.nodeEnv === 'production' ? String(Math.floor(100000 + Math.random() * 900000)) : '123456'
    const challenge = {
      id: createId('otp'),
      phone,
      role,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      verified: false,
    }

    database.otpChallenges = [challenge, ...(database.otpChallenges || []).slice(0, 20)]
    return {
      challengeId: challenge.id,
      expiresAt: challenge.expiresAt,
      delivery: 'sms',
      devOtp: env.nodeEnv === 'production' ? undefined : otp,
    }
  })
}

export async function verifyOtpChallenge({ challengeId, otp }) {
  return updateDatabase((database) => {
    const challenge = database.otpChallenges?.find((item) => item.id === challengeId)

    if (!challenge || challenge.otp !== otp || new Date(challenge.expiresAt) < new Date()) {
      const error = new Error('Invalid or expired OTP.')
      error.statusCode = 401
      throw error
    }

    challenge.verified = true
    const user =
      database.users.find((item) => item.phone === challenge.phone && item.role === challenge.role) ||
      database.users.find((item) => item.role === challenge.role)
    const token = jwt.sign({ sub: user.id, role: user.role, phone: user.phone }, env.jwtSecret, {
      expiresIn: '7d',
    })

    return { token, user }
  })
}
