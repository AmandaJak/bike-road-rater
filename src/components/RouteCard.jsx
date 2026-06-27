const SAFETY_KEY_MAP = {
  'Very Safe': 'safetyVery',
  Safe: 'safetySafe',
  Moderate: 'safetyModerate',
  Risky: 'safetyRisky',
  Dangerous: 'safetyDangerous',
}

function badgeClass(overallScore) {
  if (overallScore <= 2.5) return 'bg-[#EAF3DE] text-[#3B6D11]'
  if (overallScore <= 3.5) return 'bg-[#FAEEDA] text-[#854F0B]'
  return 'bg-[#FCEBEB] text-[#A32D2D]'
}

export default function RouteCard({ t, route, index, selected, onClick }) {
  const totalLen = route.segments.reduce((s, seg) => s + seg.length, 0)
  const labelKey = SAFETY_KEY_MAP[route.safetyLabel]
  const displayLabel = (labelKey && t[labelKey]) ?? route.safetyLabel

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl p-4 text-left transition border-2 ${
        selected
          ? 'border-[#3B6D11] bg-[#F4FAF0]'
          : 'border-transparent bg-white shadow-sm hover:shadow-md'
      }`}
      style={{ boxShadow: selected ? undefined : '0 0 0 1px #e5e7eb' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm text-gray-800">
          {t.routeLabel} {index + 1}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass(route.overallScore)}`}
        >
          {displayLabel}
        </span>
      </div>

      {/* Colour bar */}
      <div className="flex overflow-hidden rounded mb-3" style={{ height: '6px' }}>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          {t.safetyScore}: <strong className="text-gray-700">{route.overallScore.toFixed(1)}</strong> / 5
        </span>
        <span>
          <strong className="text-gray-700">{route.cyclewayPercent}%</strong> {t.cyclewayPercent}
        </span>
        <span>
          {t.distance}: <strong className="text-gray-700">{route.distanceKm} {t.km}</strong>
        </span>
        <span>
          {t.duration}: <strong className="text-gray-700">{route.durationMin} {t.min}</strong>
        </span>
      </div>
    </button>
  )
}
