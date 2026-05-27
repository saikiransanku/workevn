import { Router } from 'express'
import { requestOtp, verifyOtp } from '../../controllers/auth.controller.js'
import { asyncHandler } from '../../utils/http.js'

export const authRoutes = Router()

authRoutes.post('/otp/request', asyncHandler(requestOtp))
authRoutes.post('/otp/verify', asyncHandler(verifyOtp))
