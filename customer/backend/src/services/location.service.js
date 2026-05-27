import { updateDatabase } from '../db/fileDatabase.js'
import { createId } from '../utils/id.js'

export async function addLocation(userId, payload) {
  return updateDatabase((database) => {
    const location = {
      id: createId('loc'),
      userId,
      label: payload.label || 'Saved address',
      address: payload.address,
      city: payload.city || '',
      lat: Number(payload.lat || 0),
      lng: Number(payload.lng || 0),
      isDefault: Boolean(payload.isDefault),
    }

    if (location.isDefault) {
      database.locations.forEach((item) => {
        if (item.userId === userId) item.isDefault = false
      })
    }

    database.locations.push(location)
    return location
  })
}
