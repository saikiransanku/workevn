import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { databaseConfig } from '../config/database.js'
import { seedDatabase } from '../../../../database/seed/workven.seed.js'

async function ensureDatabase() {
  await mkdir(dirname(databaseConfig.filePath), { recursive: true })

  try {
    await readFile(databaseConfig.filePath, 'utf8')
  } catch {
    await writeDatabase(seedDatabase)
  }
}

export async function readDatabase() {
  await ensureDatabase()
  const raw = await readFile(databaseConfig.filePath, 'utf8')
  return JSON.parse(raw)
}

export async function writeDatabase(database) {
  await mkdir(dirname(databaseConfig.filePath), { recursive: true })
  await writeFile(databaseConfig.filePath, `${JSON.stringify(database, null, 2)}\n`)
  return database
}

export async function updateDatabase(mutator) {
  const database = await readDatabase()
  const result = await mutator(database)
  await writeDatabase(database)
  return result
}

export async function resetDatabase() {
  await writeDatabase(seedDatabase)
  return readDatabase()
}
