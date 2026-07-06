import { startOAuth } from '../lib/strava'

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#fff',
      gap: 32,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          nice maps
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 10, fontSize: 15 }}>
          Beautiful Strava route maps for your stories
        </p>
      </div>
      <button
        onClick={startOAuth}
        style={{
          background: '#fc4c02',
          border: 'none',
          color: '#fff',
          borderRadius: 12,
          padding: '13px 32px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        Connect Strava
      </button>
    </div>
  )
}
