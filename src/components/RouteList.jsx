import RouteCard from './RouteCard'

export default function RouteList({ t, routes, selectedRouteIndex, onSelect, status, errorKey }) {
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-500">
        <Spinner />
        <span className="text-sm">{t.calculating}</span>
      </div>
    )
  }

  if (status === 'error') {
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

  return (
    <div className="flex flex-col gap-2">
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
  )
}

function Spinner() {
  return (
    <svg
      className="h-6 w-6 animate-spin text-green-600"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}
