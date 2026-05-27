export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      response.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}.`,
      })
      return
    }

    next()
  }
}
