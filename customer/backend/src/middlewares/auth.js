import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const roleDefaults = {
  customer: 'usr-customer-1',
  worker: 'usr-worker-1',
  admin: 'usr-admin-1',
}

export function authenticateRequest(request, response, next) {
  const authHeader = request.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const devRole = request.headers['x-workven-role']

  if (token) {
    try {
      request.user = jwt.verify(token, env.jwtSecret)
      next()
      return
    } catch {
      response.status(401).json({ error: 'Invalid authentication token.' })
      return
    }
  }

  if (devRole && roleDefaults[devRole]) {
    request.user = {
      sub: roleDefaults[devRole],
      role: devRole,
    }
  }

  next()
}
