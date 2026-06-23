const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export function stripFloorFromAddress(query) {
  return query
    .split(',')
    .map((p) => p.trim())
    .filter((p) => !/^(\d+\.?\s*(tv|th|mf|vr|vt)?|st\.?|kl\.?)$/i.test(p))
    .join(', ')
}

let lastCallTime = 0

export async function geocodeAddress(query) {
  const now = Date.now()
  const elapsed = now - lastCallTime
  if (elapsed < 1100) await delay(1100 - elapsed)
  lastCallTime = Date.now()

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=dk`

  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'CycleRoutePlanner/1.0',
    },
  })

  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)

  const results = await res.json()
  if (!results.length) throw new Error('ADDRESS_NOT_FOUND')

  return [parseFloat(results[0].lon), parseFloat(results[0].lat)]
}
