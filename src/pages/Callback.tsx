import { useEffect, useState } from 'react'
import { handleCallback } from '../lib/strava'

interface Props {
  onSuccess: () => void
}

export default function Callback({ onSuccess }: Props) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const err = params.get('error')

    if (err || !code) {
      setError(err ?? 'No authorization code received')
      return
    }

    handleCallback(code)
      .then(() => {
        window.history.replaceState({}, '', '/')
        onSuccess()
      })
      .catch((e: Error) => setError(e.message))
  }, [onSuccess])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0a', color: '#fff', flexDirection: 'column', gap: 16,
      }}>
        <p style={{ color: '#ff4d4d' }}>Auth failed: {error}</p>
        <button
          onClick={() => window.location.href = '/'}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a', color: 'rgba(255,255,255,0.45)', fontSize: 14,
    }}>
      Connecting…
    </div>
  )
}
