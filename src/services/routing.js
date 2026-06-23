const ORS_URL =
  'https://api.openrouteservice.org/v2/directions/cycling-regular/geojson'

export async function fetchRoutes(fromCoords, toCoords, hardExcludes = {}) {
  const body = {
    coordinates: [fromCoords, toCoords],
    alternative_routes: { target_count: 3, share_factor: 0.6 },
    extra_info: ['waytype', 'surface'],
    options: {},
  }

  const res = await fetch(ORS_URL, {
    method: 'POST',
    headers: {
      Authorization: import.meta.env.VITE_ORS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (res.status === 403) throw new Error('DAILY_LIMIT')
  if (res.status === 429) throw new Error('RATE_LIMIT')
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`ORS_ERROR:${res.status}:${text}`)
  }

  return res.json()
}
