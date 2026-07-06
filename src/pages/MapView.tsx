import { useState } from 'react'
import type { StravaActivity, MapStyle, MapSize } from '../types'
import { SIZE_PRESETS } from '../lib/sizes'
import { computeStats } from '../lib/stats'
import MapCanvas from '../components/MapCanvas'
import StylePicker from '../components/StylePicker'
import SizePicker from '../components/SizePicker'
import StatsOverlay from '../components/StatsOverlay'

interface Props {
  activity: StravaActivity
  onBack: () => void
}

export default function MapView({ activity, onBack }: Props) {
  const [mapStyle, setMapStyle] = useState<MapStyle>('ghost')
  const [mapSize, setMapSize] = useState<MapSize>('wide')
  const [showStats, setShowStats] = useState(true)

  const preset = SIZE_PRESETS[mapSize]
  const aspectRatio = preset.width / preset.height
  const stats = computeStats(activity)

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        width: '100%',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            borderRadius: 10,
            padding: '6px 14px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <div style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.55)',
          maxWidth: 220,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {activity.name}
        </div>
      </div>

      {/* Pickers */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 16, flexShrink: 0 }}>
        <StylePicker current={mapStyle} onChange={setMapStyle} />
        <SizePicker current={mapSize} onChange={setMapSize} />
        <div style={{
          display: 'flex',
          gap: 8,
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 12,
          padding: '6px 8px',
          backdropFilter: 'blur(8px)',
        }}>
          {(['off', 'on'] as const).map((val) => (
            <button
              key={val}
              onClick={() => setShowStats(val === 'on')}
              style={{
                background: (showStats ? 'on' : 'off') === val ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: (showStats ? 'on' : 'off') === val ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
                color: (showStats ? 'on' : 'off') === val ? '#fff' : 'rgba(255,255,255,0.55)',
                borderRadius: 8,
                padding: '4px 16px',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.03em',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span>{val === 'on' ? 'Stats' : 'Map only'}</span>
              <span style={{ fontSize: 10, opacity: 0.65 }}>{val === 'on' ? 'left panel' : 'no overlay'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map preview */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px 20px',
        minHeight: 0,
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: `min(100%, calc((100vh - 220px) * ${aspectRatio}))`,
          aspectRatio: `${aspectRatio}`,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          fontSize: 'calc(100cqw / 6 * 0.18)',
          containerType: 'inline-size',
        }}>
          <MapCanvas
            encodedPolyline={activity.map.summary_polyline}
            mapStyle={mapStyle}
            mapSize={mapSize}
            activityName={activity.name}
            stats={showStats ? stats : undefined}
          />
          {showStats && <StatsOverlay stats={stats} />}
        </div>
      </div>
    </div>
  )
}
