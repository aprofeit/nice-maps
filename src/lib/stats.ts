import type { StravaActivity } from '../types'

export interface ActivityStats {
  distance: string
  distanceUnit: string
  time: string
  thirdStat: { label: string; value: string }
  elevation: string | null
  heartRate: string | null
}

const isRun = (type: string) =>
  ['Run', 'TrailRun', 'VirtualRun', 'Hike', 'Walk'].includes(type)

function formatPace(metersPerSec: number): string {
  const secPerKm = 1000 / metersPerSec
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

function formatSpeed(metersPerSec: number): string {
  return (metersPerSec * 3.6).toFixed(1)
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function computeStats(activity: StravaActivity): ActivityStats {
  const km = activity.distance / 1000
  const speed = activity.distance / activity.moving_time

  const thirdStat = isRun(activity.sport_type)
    ? { label: 'PACE', value: formatPace(speed) }
    : { label: 'SPEED', value: formatSpeed(speed) }

  const elevation = activity.total_elevation_gain > 0
    ? `${Math.round(activity.total_elevation_gain)}m`
    : null

  const heartRate = activity.average_heartrate
    ? `${Math.round(activity.average_heartrate)}`
    : null

  return {
    distance: km >= 10 ? km.toFixed(1) : km.toFixed(2),
    distanceUnit: 'km',
    time: formatTime(activity.moving_time),
    thirdStat,
    elevation,
    heartRate,
  }
}

export const STATS_PANEL_RATIO = 1 / 6

export function drawStatsOnCanvas(
  ctx: CanvasRenderingContext2D,
  stats: ActivityStats,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const scale = canvasWidth / 1080
  const panelW = Math.round(canvasWidth * STATS_PANEL_RATIO)
  const pad = Math.round(36 * scale)
  const x = pad

  const secStats = [
    { label: 'TIME', value: stats.time },
    stats.thirdStat,
    ...(stats.elevation ? [{ label: 'ELEV', value: stats.elevation }] : []),
    ...(stats.heartRate ? [{ label: 'BPM', value: stats.heartRate }] : []),
  ]

  const distSize  = Math.round(44 * scale)
  const unitSize  = Math.round(13 * scale)
  const labelSize = Math.round(10 * scale)
  const valueSize = Math.round(22 * scale)
  const secGap    = Math.round(12 * scale)

  const font = `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`

  // Start from top-left with a fixed top padding
  let y = Math.round(72 * scale)

  // Distance
  ctx.font = `bold ${distSize}px ${font}`
  ctx.fillStyle = '#ffffff'
  ctx.fillText(stats.distance, x, y + distSize)
  y += distSize + Math.round(4 * scale)

  // Unit
  ctx.font = `${unitSize}px ${font}`
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillText(stats.distanceUnit, x, y + unitSize)
  y += unitSize + Math.round(10 * scale)

  // Divider
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(x, y, panelW - pad * 2, 1)
  y += 1 + Math.round(10 * scale)

  // Secondary stats stacked
  secStats.forEach((stat, i) => {
    if (i > 0) y += secGap

    ctx.font = `${labelSize}px ${font}`
    ctx.fillStyle = 'rgba(255,255,255,0.38)'
    ctx.fillText(stat.label, x, y + labelSize)
    y += labelSize + Math.round(4 * scale)

    ctx.font = `bold ${valueSize}px ${font}`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(stat.value, x, y + valueSize)
    y += valueSize
  })
}
