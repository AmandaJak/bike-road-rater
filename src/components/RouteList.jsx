import RouteCard from './RouteCard'

export default function RouteList({
  t,
  routes,
  selectedRouteIndex,
  onSelect,
  status,
  errorKey,
  suggestedAddress,
  onUseSuggestion,
  fromAddress,
  toAddress,
}) {
  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5b6672', padding: '8px 0' }}>
        <Spinner />
        <span style={{ fontSize: '14px' }}>{t.calculating}</span>
      </div>
    )
  }

  if (status === 'error') {
    if (errorKey === 'errorSuggestAddress' && suggestedAddress) {
      const suggestion = [suggestedAddress.from, suggestedAddress.to]
        .filter(Boolean)
        .join(' → ')
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '8px', border: '1px solid #e2dfd5', background: '#fdf8f0', padding: '16px', fontSize: '14px', color: '#854F0B' }}>
          <p style={{ margin: 0 }}>
            {t.errorSuggestAddress}{' '}
            <strong>"{suggestion}"</strong>?
          </p>
          <button
            onClick={onUseSuggestion}
            style={{ flexShrink: 0, borderRadius: '6px', background: '#854F0B', border: 'none', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {t.useSuggestedAddress}
          </button>
        </div>
      )
    }
    return (
      <div style={{ borderRadius: '8px', border: '1px solid #fecaca', background: '#fff5f5', padding: '16px', fontSize: '14px', color: '#A32D2D' }}>
        {t[errorKey] ?? t.errorGeneral}
      </div>
    )
  }

  if (status === 'no_route') {
    return (
      <div style={{ borderRadius: '8px', border: '1px solid #e2dfd5', background: '#fdf8f0', padding: '16px', fontSize: '14px', color: '#854F0B' }}>
        {t.noRouteFilters}
      </div>
    )
  }

  if (!routes.length) return null

  const mapsUrl =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${encodeURIComponent(fromAddress)}` +
    `&destination=${encodeURIComponent(toAddress)}` +
    `&travelmode=bicycling`

  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a929c', marginBottom: '16px' }}>
        {t.routesSectionLabel}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {routes.map((route, i) => (
          <RouteCard
            key={i}
            t={t}
            route={route}
            index={i}
            selected={i === selectedRouteIndex}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '9px 16px',
            border: '1px solid #3B6D11',
            borderRadius: '7px',
            background: 'transparent',
            color: '#3B6D11',
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,109,17,0.07)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <MapIcon />
          {t.buildGoogleMapsRoute}
          <ExternalLinkIcon />
        </a>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" style={{ width: '20px', height: '20px', color: '#3B6D11' }} fill="none" viewBox="0 0 24 24">
      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}
