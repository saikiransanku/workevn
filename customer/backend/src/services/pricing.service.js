function roundToTen(value) {
  return Math.round(value / 10) * 10
}

export function buildEstimate({ service, slot = 'Today, 6:00 PM', emergency = false, distanceKm = 3 }) {
  const urgencyFee = emergency || slot.toLowerCase().includes('within') ? 120 : 0
  const travelFee = Math.max(40, roundToTen(distanceKm * 22))
  const materials = roundToTen(service.materialHint * 0.62)
  const labor = roundToTen(service.baseLabor)
  const subtotal = service.inspectionFee + labor + materials + travelFee + urgencyFee
  const platformFee = roundToTen(subtotal * 0.05)
  const total = subtotal + platformFee

  return {
    total,
    platformFee,
    workerPayout: total - platformFee,
    lineItems: [
      { label: 'Inspection and visit', amount: service.inspectionFee },
      { label: 'Service labor', amount: labor },
      { label: 'Materials estimate', amount: materials },
      { label: 'Travel and slot fee', amount: travelFee + urgencyFee },
      { label: 'Platform protection fee', amount: platformFee },
    ],
  }
}
