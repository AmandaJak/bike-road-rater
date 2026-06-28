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
      className={`route-card-unselected w-full p-4 text-left transition ${
        selected
          ? 'border-2 border-[#3B6D11] bg-[#f4f9ee]'
          : 'border border-[#d7d4ca] bg-white'
      }`}
      style={{
        borderRadius: '10px',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        boxShadow: selected ? undefined : '0 1px 3px rgba(20,30,40,0.06)',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c2530' }}>
          {t.routeLabel} {index + 1}
        </span>
        <span
          className={`rounded-[20px] px-[10px] py-[2px] text-xs font-semibold ${badgeClass(route.overallScore)}`}
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
      <div className="grid grid-cols-2 gap-x-2 gap-y-1" style={{ fontSize: '12px', color: '#5b6672' }}>
        <span>
          {t.safetyScore}: <strong style={{ color: '#1c2530' }}>{route.overallScore.toFixed(1)}</strong> / 5
        </span>
        <span>
          <strong style={{ color: '#1c2530' }}>{route.cyclewayPercent}%</strong> {t.cyclewayPercent}
        </span>
        <span style={{ marginTop: '2px', fontWeight: 500 }}>
          {route.distanceKm} {t.km}
        </span>
        <span style={{ marginTop: '2px', fontWeight: 500 }}>
          {route.durationMin} {t.min}
        </span>
      </div>
    </button>
  )
}
