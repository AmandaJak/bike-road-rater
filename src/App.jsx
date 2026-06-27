import { useState, useCallback } from 'react'
import AddressPanel from './components/AddressPanel'
import FilterPanel from './components/FilterPanel'
import RouteList from './components/RouteList'
import MapView from './components/MapView'
import { useRoutes } from './hooks/useRoutes'
import translations from './i18n/translations'

const DEFAULT_FILTERS = { preferCycleways: 0.5, avoidLargeRoads: 0.5 }
const DEFAULT_HARD_EXCLUDES = { avoidStateRoads: false }

export default function App() {
  const [lang, setLang] = useState('en')
  const t = translations[lang]

  const [fromAddress, setFromAddress] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [hardExcludes, setHardExcludes] = useState(DEFAULT_HARD_EXCLUDES)

  const {
    fromCoords,
    toCoords,
    routes,
    selectedRouteIndex,
    setSelectedRouteIndex,
    status,
    errorKey,
    suggestedAddress,
    search,
    reScore,
  } = useRoutes()

  const handleSearch = useCallback(() => {
    search(fromAddress, toAddress, hardExcludes)
  }, [fromAddress, toAddress, hardExcludes, search])

  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters)
      reScore(newFilters)
    },
    [reScore],
  )

  const handleUseSuggestion = useCallback(() => {
    if (!suggestedAddress) return
    const newFrom = suggestedAddress.from ?? fromAddress
    const newTo = suggestedAddress.to ?? toAddress
    setFromAddress(newFrom)
    setToAddress(newTo)
    search(newFrom, newTo, hardExcludes)
  }, [suggestedAddress, fromAddress, toAddress, hardExcludes, search])

  const handleHardExcludeChange = useCallback(
    (newHardExcludes) => {
      setHardExcludes(newHardExcludes)
      if (fromAddress && toAddress) {
        search(fromAddress, toAddress, newHardExcludes)
      }
    },
    [fromAddress, toAddress, search],
  )

  const showBottomPanel =
    status === 'loading' || status === 'error' || status === 'no_route' || routes.length > 0

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 font-sans">
      {/* Top row: sidebar + map */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel */}
        <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto border-r border-gray-200 bg-white p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-gray-900">Plan Safer Bike Hikes</h1>
            <button
              onClick={() => setLang((l) => (l === 'en' ? 'da' : 'en'))}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              {lang === 'en' ? 'DA' : 'EN'}
            </button>
          </div>

          <AddressPanel
            t={t}
            fromAddress={fromAddress}
            toAddress={toAddress}
            onFromChange={setFromAddress}
            onToChange={setToAddress}
            onSearch={handleSearch}
            loading={status === 'loading'}
          />

          <hr className="border-gray-100" />

          <FilterPanel
            t={t}
            filters={filters}
            hardExcludes={hardExcludes}
            onFilterChange={handleFilterChange}
            onHardExcludeChange={handleHardExcludeChange}
          />
        </aside>

        {/* Map */}
        <main className="relative flex-1">
          {status === 'loading' && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-gray-600">
                <svg className="h-8 w-8 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-sm font-medium">{t.calculating}</span>
              </div>
            </div>
          )}
          <MapView
            t={t}
            routes={routes}
            selectedRouteIndex={selectedRouteIndex}
            fromCoords={fromCoords}
            toCoords={toCoords}
          />
        </main>
      </div>

      {/* Bottom panel: route cards */}
      {showBottomPanel && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
          <RouteList
            t={t}
            routes={routes}
            selectedRouteIndex={selectedRouteIndex}
            onSelect={setSelectedRouteIndex}
            status={status}
            errorKey={errorKey}
            suggestedAddress={suggestedAddress}
            onUseSuggestion={handleUseSuggestion}
            fromAddress={fromAddress}
            toAddress={toAddress}
          />
        </div>
      )}
    </div>
  )
}
