export function registerRealtime(io) {
  io.on('connection', (socket) => {
    socket.on('booking:join', (bookingId) => {
      socket.join(`booking:${bookingId}`)
    })

    socket.on('worker:join', (workerId) => {
      socket.join(`worker:${workerId}`)
    })
  })
}

export function emitBookingUpdate(request, booking) {
  request.app.get('io')?.to(`booking:${booking.id}`).emit('booking:update', booking)
  request.app.get('io')?.to(`worker:${booking.workerId}`).emit('worker:job:update', booking)
}
