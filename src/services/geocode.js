export function stripFloorFromAddress(query) {
  return query
    .split(',')
    .map((p) => p.trim())
    .filter((p) => !/^(\d+\.?\s*(tv|th|mf|vr|vt)?|st\.?|kl\.?)$/i.test(p))
    .join(', ')
}

export async function geocodeAddress(query) {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)

  if (res.status === 404) throw new Error('ADDRESS_NOT_FOUND')
  if (res.status === 403) throw new Error('DAILY_LIMIT')
  if (res.status === 429) throw new Error('RATE_LIMIT')
  if (!res.ok) throw new Error('GEOCODE_FAILED')

  const data = await res.json()
  return [data.lon, data.lat]
}
