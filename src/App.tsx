import { useState, useCallback } from 'react'
import { getTokens } from './lib/strava'
import type { StravaActivity } from './types'
import Landing from './pages/Landing'
import Callback from './pages/Callback'
import Activities from './pages/Activities'
import MapView from './pages/MapView'

type View = 'landing' | 'callback' | 'activities' | 'map'

function getInitialView(): View {
  if (window.location.pathname === '/callback') return 'callback'
  if (getTokens()) return 'activities'
  return 'landing'
}

export default function App() {
  const [view, setView] = useState<View>(getInitialView)
  const [selectedActivity, setSelectedActivity] = useState<StravaActivity | null>(null)

  const handleAuthSuccess = useCallback(() => setView('activities'), [])

  function handleSelectActivity(activity: StravaActivity) {
    setSelectedActivity(activity)
    setView('map')
  }

  if (view === 'callback') return <Callback onSuccess={handleAuthSuccess} />
  if (view === 'landing' || !getTokens()) return <Landing />
  if (view === 'map' && selectedActivity) {
    return <MapView activity={selectedActivity} onBack={() => setView('activities')} />
  }
  return <Activities onSelect={handleSelectActivity} />
}
