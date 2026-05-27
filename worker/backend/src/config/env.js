export const env = {
  port: Number(process.env.PORT || process.env.API_PORT || 4300),
  webOrigin: process.env.WEB_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'workven-development-secret',
  mongoUri: process.env.MONGODB_URI || '',
  nodeEnv: process.env.NODE_ENV || 'development',
}
