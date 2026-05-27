import {
  WORKER_ID,
  addJobProof,
  getWorkerBootstrap,
  setWorkerAvailability,
  updateJobStatus,
} from '../services/worker.service.js'
import { requireFields } from '../validators/request.js'

export async function getWorkerHome(request, response) {
  response.json(await getWorkerBootstrap(WORKER_ID))
}

export async function patchAvailability(request, response) {
  requireFields(request.body, ['availability'])
  response.json(await setWorkerAvailability(WORKER_ID, request.body.availability))
}

export async function patchJobStatus(request, response) {
  requireFields(request.body, ['status'])
  response.json(await updateJobStatus(WORKER_ID, request.params.jobId, request.body.status))
}

export async function postProof(request, response) {
  requireFields(request.body, ['label'])
  response.json(await addJobProof(WORKER_ID, request.params.jobId, request.body))
}
