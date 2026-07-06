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

  // Fade bottom edge to transparent
  const grad = ctx.createLinearGradient(0, out.height - BOTTOM_FADE_PX, 0, out.height)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = grad
  ctx.fillRect(0, out.height - BOTTOM_FADE_PX, out.width, BOTTOM_FADE_PX)
  ctx.globalCompositeOperation = 'source-over'

  const dataUrl = out.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
