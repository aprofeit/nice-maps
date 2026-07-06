import { useEffect, useState } from 'react'
import { getRecentActivities, formatDistance, formatDuration, clearTokens } from '../lib/strava'
import type { StravaActivity } from '../types'

interface Props {
  onSelect: (activity: StravaActivity) => void
}

const ACTIVITY_ICONS: Record<string, string> = {
  Run: '🏃',
  Ride: '🚴',
  VirtualRide: '🚴',
  Hike: '🥾',
  Walk: '🚶',
  Swim: '🏊',
  AlpineSki: '⛷️',
  NordicSki: '⛷️',
  default: '⚡',
}

function activityIcon(type: string) {
  return ACTIVITY_ICONS[type] ?? ACTIVITY_ICONS.default
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Activities({ onSelect }: Props) {
  const [activities, setActivities] = useState<StravaActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRecentActivities()
      .then((acts) => {
        setActivities(acts.filter((a) => a.map?.summary_polyline))
        setLoading(false)
      })
      .catch((e: Error) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  function handleSignOut() {
    clearTokens()
    window.location.reload()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      padding: '32px 20px',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Recent Activities
        </h1>
        <button
          onClick={handleSignOut}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading…</p>
      )}

      {error && (
        <p style={{ color: '#ff4d4d', fontSize: 14 }}>Error: {error}</p>
      )}

      {!loading && !error && activities.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No activities with map data found.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onSelect(activity)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '14px 16px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{activityIcon(activity.sport_type)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activity.name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 }}>
                {formatDate(activity.start_date)} · {formatDistance(activity.distance, activity.sport_type)} · {formatDuration(activity.moving_time)}
              </div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
