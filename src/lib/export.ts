import type { Map } from 'maplibre-gl'
import type { SizePreset } from '../types'
import type { ActivityStats } from './stats'
import { drawStatsOnCanvas } from './stats'

export const BOTTOM_FADE_PX = 40

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

  // On iOS, use the share sheet so the user can Save Image directly to Photos
  if (navigator.share && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
    const blob = await new Promise<Blob>((resolve, reject) =>
      out.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
    )
    try {
      await navigator.share({ files: [new File([blob], filename, { type: 'image/png' })] })
      return
    } catch {
      // user cancelled — fall through to download
    }
  }

  const a = document.createElement('a')
  a.href = out.toDataURL('image/png')
  a.download = filename
  a.click()
}
