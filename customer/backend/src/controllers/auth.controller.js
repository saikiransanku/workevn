import { createOtpChallenge, verifyOtpChallenge } from '../services/auth.service.js'
import { requireFields } from '../validators/request.js'

export async function requestOtp(request, response) {
  requireFields(request.body, ['phone'])
  response.status(201).json(await createOtpChallenge(request.body))
}

export async function verifyOtp(request, response) {
  requireFields(request.body, ['challengeId', 'otp'])
  response.json(await verifyOtpChallenge(request.body))
}
