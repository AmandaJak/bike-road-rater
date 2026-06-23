const WAYTYPE_SCORE = {
  0: 3, 1: 5, 2: 4, 3: 3, 4: 2,
  5: 3, 6: 1, 7: 2, 8: 4, 9: 3, 10: 5,
}

const SCORE_COLOR = {
  1: '#22c55e',
  2: '#86efac',
  3: '#facc15',
  4: '#f97316',
  5: '#ef4444',
}

function safetyLabel(score) {
  if (score <= 1.5) return 'Very Safe'
  if (score <= 2.5) return 'Safe'
  if (score <= 3.5) return 'Moderate'
  if (score <= 4.5) return 'Risky'
  return 'Dangerous'
}

export function processRoute(orsFeature, filters = {}) {
  const coords = orsFeature.geometry.coordinates
  const props = orsFeature.properties
  const waytypeValues = props.extras?.waytype?.values ?? []

  const { preferCycleways = 0.5, avoidLargeRoads = 0.5 } = filters

  const segments = waytypeValues.map(([start, end, code]) => {
    const segCoords = coords.slice(start, end)
    const baseScore = WAYTYPE_SCORE[code] ?? 3

    let adjustedScore = baseScore
    if (code !== 6) adjustedScore *= 1 + preferCycleways * 2
    if (baseScore >= 4) adjustedScore *= 1 + avoidLargeRoads * 2
    adjustedScore = Math.min(5, adjustedScore)

    const snappedScore = Math.round(adjustedScore)
    return {
      coords: segCoords,
      waytypeCode: code,
      score: snappedScore,
      color: SCORE_COLOR[snappedScore] ?? SCORE_COLOR[3],
      length: segCoords.length,
    }
  })

  // Distance-weighted overall score
  const totalLen = segments.reduce((s, seg) => s + seg.length, 0)
  const overallScore =
    totalLen > 0
      ? segments.reduce((s, seg) => s + seg.score * seg.length, 0) / totalLen
      : 3

  const cyclewayLen = segments
    .filter((s) => s.waytypeCode === 6)
    .reduce((s, seg) => s + seg.length, 0)

  const containsStateRoad = segments.some((s) => s.waytypeCode === 1)

  const summary = props.summary
  const distanceKm = summary?.distance ? summary.distance / 1000 : 0
  const durationMin = summary?.duration ? Math.round(summary.duration / 60) : 0
  const cyclewayPercent = totalLen > 0 ? (cyclewayLen / totalLen) * 100 : 0

  return {
    segments,
    overallScore,
    safetyLabel: safetyLabel(overallScore),
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin,
    cyclewayPercent: Math.round(cyclewayPercent),
    containsStateRoad,
  }
}

export function processRoutes(orsData, filters = {}, hardExcludes = {}) {
  const features = orsData?.features ?? []

  const routes = features.map((f) => processRoute(f, filters))

  routes.sort((a, b) => a.overallScore - b.overallScore)

  if (hardExcludes.avoidStateRoads) {
    const filtered = routes.filter((r) => !r.containsStateRoad)
    return filtered.length > 0 ? filtered : null
  }

  return routes
}
