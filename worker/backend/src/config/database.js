import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const backendDir = dirname(fileURLToPath(import.meta.url))

export const databaseConfig = {
  filePath: join(backendDir, '..', 'db', 'workven-db.json'),
  provider: process.env.DATABASE_PROVIDER || (process.env.MONGODB_URI ? 'mongodb' : 'file'),
}
