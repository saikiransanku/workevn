const EARTH_RADIUS_KM = 6371

function toRadians(value) {
  return (Number(value) * Math.PI) / 180
}

export function getDistanceKm(pointA, pointB) {
  if (!pointA || !pointB) {
    return 999
  }

  const latDistance = toRadians(pointB.lat - pointA.lat)
  const lngDistance = toRadians(pointB.lng - pointA.lng)
  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(pointA.lat)) *
      Math.cos(toRadians(pointB.lat)) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2)

  return Number((EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1))
}
