import { getDistanceKm } from '../utils/distance.js'

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
}

export function calculateTrustScore(worker) {
  const education = worker.verification?.education?.score || 0
  const experience = worker.verification?.experience?.score || 0
  const previousWork = worker.verification?.previousWork?.score || 0

  return clampScore(education * 0.34 + experience * 0.33 + previousWork * 0.33)
}

function getDistanceScore(distanceKm) {
  if (distanceKm <= 2) return 100
  if (distanceKm <= 5) return 86
  if (distanceKm <= 10) return 70
  if (distanceKm <= 15) return 55
  return 35
}

function getSkillScore(worker, service) {
  if (!service) return 70
  if (worker.skillCategories?.includes(service.category)) return 100
  if (worker.skillCategories?.some((skill) => service.name.toLowerCase().includes(skill.toLowerCase()))) {
    return 92
  }
  return 40
}

export function calculateRankingScore(worker, service, customerLocation, weights) {
  const distanceKm = getDistanceKm(customerLocation, worker.location)
  const education = worker.verification?.education?.score || 0
  const experience = worker.verification?.experience?.score || 0
  const previousWork = worker.verification?.previousWork?.score || 0
  const ratingScore = worker.ratingScore || worker.rating * 20
  const distanceScore = getDistanceScore(distanceKm)
  const completionRate = worker.completionRate || 0
  const skillScore = getSkillScore(worker, service)
  const rankingWeights = weights || {
    education: 0.18,
    experience: 0.2,
    previousWork: 0.2,
    rating: 0.17,
    distance: 0.15,
    completionRate: 0.1,
  }

  const baseScore =
    education * rankingWeights.education +
    experience * rankingWeights.experience +
    previousWork * rankingWeights.previousWork +
    ratingScore * rankingWeights.rating +
    distanceScore * rankingWeights.distance +
    completionRate * rankingWeights.completionRate

  return {
    distanceKm,
    trustScore: calculateTrustScore(worker),
    rankingScore: clampScore(baseScore * 0.82 + skillScore * 0.18),
  }
}

export function rankWorkers(workers, service, customerLocation, weights) {
  return workers
    .filter((worker) => worker.status === 'approved')
    .filter((worker) => !service || getSkillScore(worker, service) >= 90)
    .map((worker) => {
      const scores = calculateRankingScore(worker, service, customerLocation, weights)
      let rankGroup = 'Other available workers'

      if (scores.rankingScore >= 88 && scores.trustScore >= 88) {
        rankGroup = 'Best verified match'
      } else if (scores.rankingScore >= 72) {
        rankGroup = 'Middle-ranked workers'
      }

      return {
        ...worker,
        ...scores,
        rankGroup,
      }
    })
    .sort((a, b) => b.rankingScore - a.rankingScore)
}
