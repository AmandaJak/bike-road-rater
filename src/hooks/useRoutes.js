import { useState, useCallback, useRef } from 'react'
import { geocodeAddress } from '../services/geocode'
import { fetchRoutes } from '../services/routing'
import { processRoutes } from '../services/scoring'

export function useRoutes() {
  const [fromCoords, setFromCoords] = useState(null)
  const [toCoords, setToCoords] = useState(null)
  const [rawOrsData, setRawOrsData] = useState(null)
  const [routes, setRoutes] = useState([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [status, setStatus] = useState('idle')
  const [errorKey, setErrorKey] = useState(null)

  const filtersRef = useRef({ preferCycleways: 0.5, avoidLargeRoads: 0.5 })
  const hardExcludesRef = useRef({ avoidStateRoads: false })

  const search = useCallback(async (fromAddress, toAddress, hardExcludes) => {
    hardExcludesRef.current = hardExcludes
    setStatus('loading')
    setErrorKey(null)
    setRoutes([])

    try {
      const [from, to] = await Promise.all([
        geocodeAddress(fromAddress),
        geocodeAddress(toAddress),
      ])
      setFromCoords(from)
      setToCoords(to)

      const data = await fetchRoutes(from, to, hardExcludes)
      setRawOrsData(data)

      const processed = processRoutes(data, filtersRef.current, hardExcludes)
      if (!processed) {
        setStatus('no_route')
        return
      }

      setRoutes(processed)
      setSelectedRouteIndex(0)
      setStatus('idle')
    } catch (err) {
      console.error('[useRoutes] error:', err)
      if (err.message === 'ADDRESS_NOT_FOUND') setErrorKey('errorAddressNotFound')
      else if (err.message === 'DAILY_LIMIT') setErrorKey('errorDailyLimit')
      else if (err.message === 'RATE_LIMIT') setErrorKey('errorRateLimit')
      else setErrorKey('errorGeneral')
      setStatus('error')
    }
  }, [])

  const reScore = useCallback(
    (newFilters) => {
      filtersRef.current = newFilters
      if (!rawOrsData) return
      const processed = processRoutes(
        rawOrsData,
        newFilters,
        hardExcludesRef.current,
      )
      if (!processed) {
        setStatus('no_route')
        setRoutes([])
        return
      }
      setStatus('idle')
      setRoutes(processed)
      setSelectedRouteIndex(0)
    },
    [rawOrsData],
  )

  return {
    fromCoords,
    toCoords,
    routes,
    selectedRouteIndex,
    setSelectedRouteIndex,
    status,
    errorKey,
    search,
    reScore,
  }
}
