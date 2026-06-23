const SAFETY_BADGE_COLOR = {
  'Very Safe': 'bg-green-100 text-green-800',
  Safe: 'bg-green-50 text-green-700',
  Moderate: 'bg-yellow-100 text-yellow-800',
  Risky: 'bg-orange-100 text-orange-800',
  Dangerous: 'bg-red-100 text-red-800',
}

const SAFETY_BADGE_COLOR_DA = {
  'Meget sikker': 'bg-green-100 text-green-800',
  Sikker: 'bg-green-50 text-green-700',
  Moderat: 'bg-yellow-100 text-yellow-800',
  Risikabel: 'bg-orange-100 text-orange-800',
  Farlig: 'bg-red-100 text-red-800',
}

export default function RouteCard({ t, route, index, selected, onClick }) {
  const badgeClass =
    SAFETY_BADGE_COLOR[route.safetyLabel] ??
    SAFETY_BADGE_COLOR_DA[route.safetyLabel] ??
    'bg-gray-100 text-gray-700'

  const totalLen = route.segments.reduce((s, seg) => s + seg.length, 0)

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? 'border-green-500 bg-green-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-gray-800">
          {t.routeLabel} {index + 1}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
          {route.safetyLabel}
        </span>
      </div>

      {/* Segmented color bar */}
      <div className="flex rounded overflow-hidden h-2 mb-2">
        {route.segments.map((seg, i) => (
          <div
            key={i}
            style={{
              backgroundColor: seg.color,
              flex: seg.length / (totalLen || 1),
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-600">
        <span>
          {t.safetyScore}: <strong>{route.overallScore.toFixed(1)}</strong> / 5
        </span>
        <span>
          {route.cyclewayPercent}% {t.cyclewayPercent}
        </span>
        <span>
          {t.distance}: <strong>{route.distanceKm} {t.km}</strong>
        </span>
        <span>
          {t.duration}: <strong>{route.durationMin} {t.min}</strong>
        </span>
      </div>
    </button>
  )
}
