import { readDatabase, updateDatabase } from '../db/fileDatabase.js'

const WORKER_ID = 'wrk-praveen'

export async function getWorkerBootstrap(workerId = WORKER_ID) {
  const database = await readDatabase()
  const profile = database.workers.find((worker) => worker.id === workerId)
  const jobs = database.workerRequests.filter((job) => job.workerId === workerId)

  return {
    profile,
    jobs,
    earnings: {
      today: 1820,
      week: 12480,
      month: 48760,
      commissionPercent: database.settings.commissionPercent,
    },
    verificationLayers: profile?.verification || {},
  }
}

export async function setWorkerAvailability(workerId, availability) {
  return updateDatabase((database) => {
    const worker = database.workers.find((item) => item.id === workerId)
    worker.availability = availability
    return worker
  })
}

export async function updateJobStatus(workerId, jobId, status) {
  return updateDatabase((database) => {
    const job = database.workerRequests.find((item) => item.id === jobId && item.workerId === workerId)

    if (!job) {
      const error = new Error('Worker job not found.')
      error.statusCode = 404
      throw error
    }

    job.status = status
    return job
  })
}

export async function addJobProof(workerId, jobId, proof) {
  return updateDatabase((database) => {
    const job = database.workerRequests.find((item) => item.id === jobId && item.workerId === workerId)

    if (!job) {
      const error = new Error('Worker job not found.')
      error.statusCode = 404
      throw error
    }

    job.proofPhotos = [...(job.proofPhotos || []), proof]
    return job
  })
}

export { WORKER_ID }
