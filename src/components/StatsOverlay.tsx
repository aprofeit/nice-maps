import type { ActivityStats } from '../lib/stats'
import { STATS_PANEL_RATIO } from '../lib/stats'

interface Props {
  stats: ActivityStats
}

export default function StatsOverlay({ stats }: Props) {
  const secStats = [
    { label: 'TIME', value: stats.time },
    stats.thirdStat,
    ...(stats.elevation ? [{ label: 'ELEV', value: stats.elevation }] : []),
    ...(stats.heartRate ? [{ label: 'BPM', value: stats.heartRate }] : []),
  ]

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
    }}>
      <div style={{
        width: `${STATS_PANEL_RATIO * 100}%`,
        padding: '5% 0 0 5%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Distance hero */}
        <div style={{ lineHeight: 1, marginBottom: '0.4em' }}>
          <div style={{ fontSize: '2em', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            {stats.distance}
          </div>
          <div style={{ fontSize: '0.65em', color: 'rgba(255,255,255,0.45)', marginTop: '0.15em' }}>
            {stats.distanceUnit}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '0.4em 0', width: '70%' }} />

        {/* Secondary stats stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
          {secStats.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '0.45em', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.08em', marginBottom: '0.15em' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.85em', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
