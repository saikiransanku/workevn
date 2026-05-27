import { readDatabase, updateDatabase } from '../db/fileDatabase.js'

const CUSTOMER_ID = 'usr-customer-1'

export async function getCustomerBootstrap(customerId = CUSTOMER_ID) {
  const database = await readDatabase()
  const profile = database.users.find((user) => user.id === customerId)

  return {
    profile,
    services: database.services,
    locations: database.locations.filter((location) => location.userId === customerId),
    bookings: database.bookings.filter((booking) => booking.customerId === customerId),
    complaints: database.complaints.filter((complaint) => complaint.customerId === customerId),
    notifications: database.notifications.filter((notification) => notification.userId === customerId),
    favoriteWorkerIds: profile?.favoriteWorkerIds || [],
  }
}

export async function updateCustomerProfile(customerId, updates) {
  const allowedFields = ['name', 'photoUrl', 'preferences']

  return updateDatabase((database) => {
    const profile = database.users.find((user) => user.id === customerId)

    if (!profile) {
      const error = new Error('Customer profile not found.')
      error.statusCode = 404
      throw error
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        profile[field] = updates[field]
      }
    }

    return profile
  })
}

export async function toggleFavoriteWorker(customerId, workerId) {
  return updateDatabase((database) => {
    const profile = database.users.find((user) => user.id === customerId)
    const favorites = new Set(profile.favoriteWorkerIds || [])

    if (favorites.has(workerId)) {
      favorites.delete(workerId)
    } else {
      favorites.add(workerId)
    }

    profile.favoriteWorkerIds = [...favorites]
    return profile.favoriteWorkerIds
  })
}

export { CUSTOMER_ID }
