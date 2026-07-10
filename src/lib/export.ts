import type { Map } from 'maplibre-gl'
import type { SizePreset } from '../types'
import type { ActivityStats } from './stats'
import { drawStatsOnCanvas } from './stats'

export const BOTTOM_FADE_PX = 20

export async function exportMapPng(
  map: Map,
  size: SizePreset,
  stats: ActivityStats | undefined,
  filename = 'nice-map.png',
): Promise<void> {
  await new Promise<void>((resolve) => {
    if (map.loaded()) resolve()
    else map.once('idle', () => resolve())
  })

  const canvas = map.getCanvas()
  const out = document.createElement('canvas')
  // Derive height from the actual canvas ratio so nothing is ever cropped
  out.width = size.width
  out.height = Math.round(canvas.height * (size.width / canvas.width))
  const ctx = out.getContext('2d')!

  ctx.drawImage(canvas, 0, 0, out.width, out.height)

  if (stats) {
    drawStatsOnCanvas(ctx, stats, out.width, out.height)
  }

  // Fade bottom edge to transparent via direct pixel manipulation
  // (avoids destination-out composite which breaks alpha on iOS Safari)
  const imageData = ctx.getImageData(0, out.height - BOTTOM_FADE_PX, out.width, BOTTOM_FADE_PX)
  const { data } = imageData
  for (let row = 0; row < BOTTOM_FADE_PX; row++) {
    const alpha = 1 - row / (BOTTOM_FADE_PX - 1)
    for (let col = 0; col < out.width; col++) {
      const i = (row * out.width + col) * 4 + 3
      data[i] = Math.round(data[i] * alpha)
    }
  }
  ctx.putImageData(imageData, 0, out.height - BOTTOM_FADE_PX)

  const dataUrl = out.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
