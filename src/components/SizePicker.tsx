import type { MapSize } from '../types'
import { SIZE_PRESETS, SIZE_ORDER } from '../lib/sizes'

interface Props {
  current: MapSize
  onChange: (size: MapSize) => void
}

export default function SizePicker({ current, onChange }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      background: 'rgba(0,0,0,0.55)',
      borderRadius: 12,
      padding: '6px 8px',
      backdropFilter: 'blur(8px)',
    }}>
      {SIZE_ORDER.map((s) => {
        const preset = SIZE_PRESETS[s]
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            style={{
              background: current === s ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: current === s ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
              color: current === s ? '#fff' : 'rgba(255,255,255,0.55)',
              borderRadius: 8,
              padding: '4px 12px',
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
            <span>{preset.label}</span>
            <span style={{ fontSize: 10, opacity: 0.65 }}>{preset.description}</span>
          </button>
        )
      })}
    </div>
  )
}
