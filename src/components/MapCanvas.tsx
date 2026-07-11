import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import polyline from '@mapbox/polyline'
import type { MapStyle } from '../types'
import { STYLES, ROUTE_LAYER_CONFIG } from '../lib/styles'
import { exportMapPng } from '../lib/export'
import { WIDE } from '../lib/sizes'
import type { ActivityStats } from '../lib/stats'
import { STATS_PANEL_RATIO } from '../lib/stats'
import { BOTTOM_FADE_PX } from '../lib/export'

interface Props {
  encodedPolyline: string
  mapStyle: MapStyle
  activityName: string
  stats?: ActivityStats
}

export default function MapCanvas({ encodedPolyline, mapStyle, activityName, stats }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const boundsRef = useRef<maplibregl.LngLatBoundsLike | null>(null)
  const [exporting, setExporting] = useState(false)

  function fitRoute(map: maplibregl.Map) {
    if (!boundsRef.current) return
    const leftPad = stats
      ? Math.round(map.getCanvas().offsetWidth * STATS_PANEL_RATIO) + 40
      : 60
    map.fitBounds(boundsRef.current, { padding: { top: 60, bottom: 60 + BOTTOM_FADE_PX, left: leftPad, right: 60 }, animate: false })
  }

  useEffect(() => {
    if (!containerRef.current) return

    const coords = polyline.decode(encodedPolyline).map(([lat, lng]) => [lng, lat] as [number, number])
    const lngs = coords.map(([lng]) => lng)
    const lats = coords.map(([, lat]) => lat)
    boundsRef.current = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ]

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES[mapStyle],
      center: [0, 0],
      zoom: 1,
      attributionControl: false,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    })

    mapRef.current = map

    map.on('load', () => {
      addRouteLayers(map, coords)
      fitRoute(map)
    })

    return () => map.remove()
  }, [encodedPolyline])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.loaded()) return
    const coords = polyline.decode(encodedPolyline).map(([lat, lng]) => [lng, lat] as [number, number])
    map.setStyle(STYLES[mapStyle])
    map.once('styledata', () => addRouteLayers(map, coords))
  }, [mapStyle])

  // Re-fit when stats toggle changes (affects left padding)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.loaded()) return
    fitRoute(map)
  }, [stats])

  async function handleExport() {
    const map = mapRef.current
    if (!map) return
    setExporting(true)
    try {
      const slug = activityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await exportMapPng(map, WIDE, stats, `${slug}-${mapStyle}.png`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            background: exporting ? 'rgba(255,255,255,0.15)' : 'rgba(255,77,0,0.9)',
            border: 'none',
            color: '#fff',
            borderRadius: 12,
            padding: '10px 28px',
            fontSize: 14,
            fontWeight: 600,
            cursor: exporting ? 'default' : 'pointer',
            letterSpacing: '0.04em',
            boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
            transition: 'all 0.15s',
          }}
        >
          {exporting ? 'Exporting…' : 'Export PNG'}
        </button>
      </div>
    </div>
  )
}

function addRouteLayers(map: maplibregl.Map, coords: [number, number][]) {
  const geojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords },
      properties: {},
    }],
  }

  if (!map.getSource('route')) {
    map.addSource('route', { type: 'geojson', data: geojson })
  }
  if (!map.getLayer('route-glow')) {
    map.addLayer({ id: 'route-glow', type: 'line', source: 'route', paint: ROUTE_LAYER_CONFIG.glow })
  }
  if (!map.getLayer('route-stroke')) {
    map.addLayer({ id: 'route-stroke', type: 'line', source: 'route', paint: ROUTE_LAYER_CONFIG.stroke })
  }
  if (!map.getLayer('route-main')) {
    map.addLayer({
      id: 'route-main',
      type: 'line',
      source: 'route',
      layout: {
        'line-cap': ROUTE_LAYER_CONFIG.main['line-cap'],
        'line-join': ROUTE_LAYER_CONFIG.main['line-join'],
      },
      paint: {
        'line-color': ROUTE_LAYER_CONFIG.main['line-color'],
        'line-width': ROUTE_LAYER_CONFIG.main['line-width'],
        'line-opacity': ROUTE_LAYER_CONFIG.main['line-opacity'],
      },
    })
  }
}
