import {
  CUSTOMER_ID,
  getCustomerBootstrap,
  toggleFavoriteWorker,
  updateCustomerProfile,
} from '../services/customer.service.js'

export async function getBootstrap(request, response) {
  response.json(await getCustomerBootstrap(request.user?.sub || CUSTOMER_ID))
}

export async function patchProfile(request, response) {
  response.json(await updateCustomerProfile(request.user?.sub || CUSTOMER_ID, request.body))
}

export async function toggleFavorite(request, response) {
  response.json({
    favoriteWorkerIds: await toggleFavoriteWorker(
      request.user?.sub || CUSTOMER_ID,
      request.params.workerId,
    ),
  })
}
