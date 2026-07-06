import type { MapSize, SizePreset } from '../types'

export const SIZE_PRESETS: Record<MapSize, SizePreset> = {
  banner: { label: 'Banner', width: 1080, height: 540,  description: '2:1 · top strip' },
  wide:   { label: 'Wide',   width: 1080, height: 720,  description: '3:2 · top third' },
  half:   { label: 'Half',   width: 1080, height: 960,  description: '9:8 · top half' },
  square: { label: 'Square', width: 1080, height: 1080, description: '1:1 · classic' },
}

export const SIZE_ORDER: MapSize[] = ['banner', 'wide', 'half', 'square']
