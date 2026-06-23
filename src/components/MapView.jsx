import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

function FitBounds({ routes, selectedRouteIndex }) {
  const map = useMap()
  const prevBoundsKey = useRef(null)

  useEffect(() => {
    if (!routes.length) return
    const route = routes[selectedRouteIndex] ?? routes[0]
    const allCoords = route.segments.flatMap((seg) =>
      seg.coords.map(([lon, lat]) => [lat, lon]),
    )
    if (!allCoords.length) return

    const key = `${selectedRouteIndex}-${allCoords.length}`
    if (key === prevBoundsKey.current) return
    prevBoundsKey.current = key

    map.fitBounds(allCoords, { padding: [40, 40] })
  }, [routes, selectedRouteIndex, map])

  return null
}

export default function MapView({ t, routes, selectedRouteIndex, fromCoords, toCoords }) {
  return (
    <MapContainer
      center={[56, 10]}
      zoom={7}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
        attribution={t.mapAttribution}
        maxZoom={20}
      />

      <FitBounds routes={routes} selectedRouteIndex={selectedRouteIndex} />

      {routes.map((route, routeIdx) =>
        route.segments.map((seg, segIdx) => (
          <Polyline
            key={`${routeIdx}-${segIdx}`}
            positions={seg.coords.map(([lon, lat]) => [lat, lon])}
            pathOptions={{
              color: seg.color,
              weight: routeIdx === selectedRouteIndex ? 6 : 3,
              opacity: routeIdx === selectedRouteIndex ? 1.0 : 0.4,
            }}
          />
        )),
      )}

      {fromCoords && (
        <CircleMarker
          center={[fromCoords[1], fromCoords[0]]}
          radius={8}
          pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 1 }}
        />
      )}
      {toCoords && (
        <CircleMarker
          center={[toCoords[1], toCoords[0]]}
          radius={8}
          pathOptions={{ color: '#b91c1c', fillColor: '#ef4444', fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  )
}
