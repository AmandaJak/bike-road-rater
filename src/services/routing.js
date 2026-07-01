// API key is now handled server-side in src/backend/.env

export async function fetchRoutes(fromCoords, toCoords, hardExcludes = {}) {
  const res = await fetch('/api/routes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from_coords: fromCoords,
      to_coords: toCoords,
      hard_excludes: hardExcludes,
    }),
  })

  if (res.status === 403) throw new Error('DAILY_LIMIT')
  if (res.status === 429) throw new Error('RATE_LIMIT')
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`ORS_ERROR:${res.status}:${text}`)
  }

  return res.json()
}
