import type { StyleSpecification } from 'maplibre-gl'
import type { MapStyle } from '../types'

const KEY = import.meta.env.VITE_MAPTILER_API_KEY

// Route layer shared config
export const ROUTE_LAYER_CONFIG = {
  glow: {
    'line-color': '#ffffff',
    'line-width': 14,
    'line-opacity': 0.25,
    'line-blur': 8,
  },
  stroke: {
    'line-color': '#ffffff',
    'line-width': 3,
    'line-opacity': 0.5,
  },
  main: {
    'line-color': '#ff4d00',
    'line-width': 4,
    'line-opacity': 1,
    'line-cap': 'round' as const,
    'line-join': 'round' as const,
  },
}

// Ghost: near-monochrome, minimal detail, barely-there map
export const ghostStyle: StyleSpecification = {
  version: 8,
  glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${KEY}`,
  sources: {
    openmaptiles: {
      type: 'vector',
      url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${KEY}`,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': 'rgba(0,0,0,0)' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': 'rgba(180,190,200,0.35)' },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'forest', 'grass', 'meadow'],
      paint: { 'fill-color': 'rgba(200,210,195,0.2)' },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      paint: { 'line-color': 'rgba(150,150,150,0.2)', 'line-width': 0.5 },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'secondary', 'tertiary'],
      paint: { 'line-color': 'rgba(140,140,140,0.3)', 'line-width': 1 },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'trunk'],
      paint: { 'line-color': 'rgba(120,120,120,0.4)', 'line-width': 1.5 },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: { 'line-color': 'rgba(100,100,100,0.45)', 'line-width': 2 },
    },
  ],
}

// Terrain: natural earth tones, hillshade, contours, medium detail
export const terrainStyle: StyleSpecification = {
  version: 8,
  glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${KEY}`,
  sources: {
    openmaptiles: {
      type: 'vector',
      url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${KEY}`,
    },
    terrain: {
      type: 'raster-dem',
      url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${KEY}`,
      tileSize: 256,
    },
    contours: {
      type: 'vector',
      url: `https://api.maptiler.com/tiles/contours-v2/tiles.json?key=${KEY}`,
    },
  },
  terrain: { source: 'terrain', exaggeration: 1 },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': 'rgba(0,0,0,0)' },
    },
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'terrain',
      paint: {
        'hillshade-shadow-color': 'rgba(60,40,20,0.5)',
        'hillshade-highlight-color': 'rgba(255,245,230,0.3)',
        'hillshade-accent-color': 'rgba(80,60,30,0.3)',
        'hillshade-exaggeration': 0.6,
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': 'rgba(130,170,190,0.5)' },
    },
    {
      id: 'landuse-forest',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'forest', 'wood'],
      paint: { 'fill-color': 'rgba(100,130,80,0.3)' },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'grass', 'meadow'],
      paint: { 'fill-color': 'rgba(150,175,110,0.25)' },
    },
    {
      id: 'contour-minor',
      type: 'line',
      source: 'contours',
      'source-layer': 'contour',
      filter: ['==', ['get', 'nth_line'], 1],
      paint: { 'line-color': 'rgba(120,90,50,0.25)', 'line-width': 0.5 },
    },
    {
      id: 'contour-major',
      type: 'line',
      source: 'contours',
      'source-layer': 'contour',
      filter: ['==', ['get', 'nth_line'], 5],
      paint: { 'line-color': 'rgba(120,90,50,0.45)', 'line-width': 1 },
    },
    {
      id: 'road-path',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'path', 'track'],
      paint: {
        'line-color': 'rgba(160,120,70,0.5)',
        'line-width': 1,
        'line-dasharray': [2, 2],
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service'],
      paint: { 'line-color': 'rgba(180,155,110,0.4)', 'line-width': 0.75 },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'secondary', 'tertiary'],
      paint: { 'line-color': 'rgba(190,160,100,0.5)', 'line-width': 1.25 },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'trunk', 'motorway'],
      paint: { 'line-color': 'rgba(200,165,90,0.6)', 'line-width': 2 },
    },
    {
      id: 'label-peak',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'mountain_peak',
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10,
        'text-anchor': 'top',
        'text-offset': [0, 0.5],
      },
      paint: {
        'text-color': 'rgba(80,55,30,0.8)',
        'text-halo-color': 'rgba(240,225,200,0.6)',
        'text-halo-width': 1,
      },
    },
  ],
}

// Blueprint: dark navy, fine cyan/white linework, full streets
export const blueprintStyle: StyleSpecification = {
  version: 8,
  glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${KEY}`,
  sources: {
    openmaptiles: {
      type: 'vector',
      url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${KEY}`,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': 'rgba(8,20,48,0.88)' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': 'rgba(20,50,100,0.7)' },
    },
    {
      id: 'water-outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'line-color': 'rgba(80,160,220,0.4)', 'line-width': 0.5 },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'forest', 'grass', 'meadow', 'wood'],
      paint: { 'fill-color': 'rgba(20,50,40,0.4)' },
    },
    {
      id: 'building',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: { 'fill-color': 'rgba(30,55,100,0.5)', 'fill-outline-color': 'rgba(60,110,180,0.3)' },
    },
    {
      id: 'road-path',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'path', 'track'],
      paint: {
        'line-color': 'rgba(80,160,200,0.3)',
        'line-width': 0.5,
        'line-dasharray': [2, 3],
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service'],
      paint: { 'line-color': 'rgba(80,150,210,0.35)', 'line-width': 0.75 },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'secondary', 'tertiary'],
      paint: { 'line-color': 'rgba(100,175,230,0.5)', 'line-width': 1.25 },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'primary', 'trunk'],
      paint: { 'line-color': 'rgba(120,200,240,0.65)', 'line-width': 2 },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      paint: { 'line-color': 'rgba(140,220,255,0.75)', 'line-width': 2.5 },
    },
    {
      id: 'label-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['in', 'class', 'city', 'town'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 8, 9, 14, 13],
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': 'rgba(160,210,240,0.8)',
        'text-halo-color': 'rgba(8,20,48,0.8)',
        'text-halo-width': 1,
      },
    },
  ],
}

export const STYLES: Record<MapStyle, StyleSpecification> = {
  ghost: ghostStyle,
  terrain: terrainStyle,
  blueprint: blueprintStyle,
}

export const STYLE_LABELS: Record<MapStyle, string> = {
  ghost: 'Ghost',
  terrain: 'Terrain',
  blueprint: 'Blueprint',
}
