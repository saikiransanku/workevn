import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { env } from './config/env.js'
import { authenticateRequest } from './middlewares/auth.js'
import { attachRequestContext } from './middlewares/requestContext.js'
import { apiRoutes } from './routes/index.js'
import { registerRealtime } from './sockets/realtime.js'
import { errorHandler, notFoundHandler } from './utils/http.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: env.webOrigin,
    methods: ['GET', 'POST', 'PATCH'],
  },
})

registerRealtime(io)
app.set('io', io)

app.use(
  cors({
    origin: env.webOrigin,
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use(attachRequestContext)
app.use(authenticateRequest)
app.use('/api', apiRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

httpServer.listen(env.port, () => {
  console.log(`Workven API running at http://localhost:${env.port}/api`)
})
