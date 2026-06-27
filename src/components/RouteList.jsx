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
      <div className="flex items-center gap-3 text-gray-500 py-2">
        <Spinner />
        <span className="text-sm">{t.calculating}</span>
      </div>
    )
  }

  if (status === 'error') {
    if (errorKey === 'errorSuggestAddress' && suggestedAddress) {
      const suggestion = [suggestedAddress.from, suggestedAddress.to]
        .filter(Boolean)
        .join(' → ')
      return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900 flex items-center gap-4">
          <p>
            {t.errorSuggestAddress}{' '}
            <strong>"{suggestion}"</strong>?
          </p>
          <button
            onClick={onUseSuggestion}
            className="shrink-0 rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-700"
          >
            {t.useSuggestedAddress}
          </button>
        </div>
      )
    }
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t[errorKey] ?? t.errorGeneral}
      </div>
    )
  }

  if (status === 'no_route') {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
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
      <div className="grid grid-cols-3 gap-4">
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

      <div className="mt-3 flex justify-end">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-[#3B6D11] px-4 py-2 text-xs font-semibold text-[#3B6D11] transition hover:bg-[#EAF3DE]"
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
    <svg className="h-5 w-5 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}
