import type { MapStyle } from '../types'
import { STYLE_LABELS } from '../lib/styles'

interface Props {
  current: MapStyle
  onChange: (style: MapStyle) => void
}

const styles: MapStyle[] = ['ghost', 'terrain', 'blueprint']

export default function StylePicker({ current, onChange }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      background: 'rgba(0,0,0,0.55)',
      borderRadius: 12,
      padding: '6px 8px',
      backdropFilter: 'blur(8px)',
    }}>
      {styles.map((s) => (
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
          }}
        >
          {STYLE_LABELS[s]}
        </button>
      ))}
    </div>
  )
}
