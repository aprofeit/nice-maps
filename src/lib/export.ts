import type { Map } from 'maplibre-gl'
import type { SizePreset } from '../types'

export async function exportMapPng(map: Map, size: SizePreset, filename = 'nice-map.png'): Promise<void> {
  await new Promise<void>((resolve) => {
    if (map.loaded()) resolve()
    else map.once('idle', () => resolve())
  })

  const canvas = map.getCanvas()
  const out = document.createElement('canvas')
  out.width = size.width
  out.height = size.height
  const ctx = out.getContext('2d')!

  const scale = Math.max(out.width / canvas.width, out.height / canvas.height)
  const scaledW = canvas.width * scale
  const scaledH = canvas.height * scale
  const offsetX = (out.width - scaledW) / 2
  const offsetY = (out.height - scaledH) / 2

  ctx.drawImage(canvas, offsetX, offsetY, scaledW, scaledH)

  const dataUrl = out.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
