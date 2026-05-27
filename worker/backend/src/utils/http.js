export function asyncHandler(handler) {
  return async (request, response, next) => {
    try {
      await handler(request, response, next)
    } catch (error) {
      next(error)
    }
  }
}

export function notFoundHandler(request, response) {
  response.status(404).json({
    error: 'Route not found.',
    path: request.originalUrl,
  })
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error)
    return
  }

  response.status(error.statusCode || 500).json({
    error: error.message || 'Unexpected Workven API error.',
  })
}
