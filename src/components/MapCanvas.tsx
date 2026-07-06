import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import polyline from '@mapbox/polyline'
import type { MapStyle, MapSize } from '../types'
import { STYLES, ROUTE_LAYER_CONFIG } from '../lib/styles'
import { exportMapPng } from '../lib/export'
import { SIZE_PRESETS } from '../lib/sizes'

interface Props {
  encodedPolyline: string
  mapStyle: MapStyle
  mapSize: MapSize
  activityName: string
}

export default function MapCanvas({ encodedPolyline, mapStyle, mapSize, activityName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const coords = polyline.decode(encodedPolyline).map(([lat, lng]) => [lng, lat] as [number, number])

    // Compute bounds
    const lngs = coords.map(([lng]) => lng)
    const lats = coords.map(([, lat]) => lat)
    const bounds: maplibregl.LngLatBoundsLike = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ]

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLES[mapStyle],
      bounds,
      fitBoundsOptions: { padding: 80 },
      attributionControl: false,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    })

    mapRef.current = map

    map.on('load', () => {
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {},
        }],
      }

      map.addSource('route', { type: 'geojson', data: geojson })

      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        paint: ROUTE_LAYER_CONFIG.glow,
      })
      map.addLayer({
        id: 'route-stroke',
        type: 'line',
        source: 'route',
        paint: ROUTE_LAYER_CONFIG.stroke,
      })
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
    })

    return () => map.remove()
  }, [encodedPolyline])

  // Update style without re-creating the map
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.loaded()) return

    const coords = polyline.decode(encodedPolyline).map(([lat, lng]) => [lng, lat] as [number, number])
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {},
      }],
    }

    map.setStyle(STYLES[mapStyle])
    map.once('styledata', () => {
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
          layout: { 'line-cap': ROUTE_LAYER_CONFIG.main['line-cap'], 'line-join': ROUTE_LAYER_CONFIG.main['line-join'] },
          paint: {
            'line-color': ROUTE_LAYER_CONFIG.main['line-color'],
            'line-width': ROUTE_LAYER_CONFIG.main['line-width'],
            'line-opacity': ROUTE_LAYER_CONFIG.main['line-opacity'],
          },
        })
      }
    })
  }, [mapStyle])

  async function handleExport() {
    const map = mapRef.current
    if (!map) return
    setExporting(true)
    try {
      const slug = activityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await exportMapPng(map, SIZE_PRESETS[mapSize], `${slug}-${mapStyle}-${mapSize}.png`)
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
