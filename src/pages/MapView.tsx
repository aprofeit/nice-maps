import { useState } from 'react'
import type { StravaActivity, MapStyle, MapSize } from '../types'
import { SIZE_PRESETS } from '../lib/sizes'
import MapCanvas from '../components/MapCanvas'
import StylePicker from '../components/StylePicker'
import SizePicker from '../components/SizePicker'

interface Props {
  activity: StravaActivity
  onBack: () => void
}

export default function MapView({ activity, onBack }: Props) {
  const [mapStyle, setMapStyle] = useState<MapStyle>('ghost')
  const [mapSize, setMapSize] = useState<MapSize>('wide')

  const preset = SIZE_PRESETS[mapSize]
  const aspectRatio = preset.width / preset.height

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
      </div>

      {/* Map preview — constrained to selected aspect ratio */}
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
          maxWidth: `min(100%, calc((100vh - 180px) * ${aspectRatio}))`,
          aspectRatio: `${aspectRatio}`,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        }}>
          <MapCanvas
            encodedPolyline={activity.map.summary_polyline}
            mapStyle={mapStyle}
            mapSize={mapSize}
            activityName={activity.name}
          />
        </div>
      </div>
    </div>
  )
}
