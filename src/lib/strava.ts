import type { AuthTokens, StravaActivity, StravaDetailedActivity } from '../types'

const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_STRAVA_CLIENT_SECRET
const REDIRECT_URI = `${window.location.origin}/callback`
const TOKEN_KEY = 'strava_tokens'

// PKCE helpers
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function startOAuth(): Promise<void> {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  sessionStorage.setItem('pkce_verifier', verifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'activity:read_all',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `https://www.strava.com/oauth/authorize?${params}`
}

export async function handleCallback(code: string): Promise<void> {
  // Strava doesn't support PKCE token exchange — fall back to client secret exchange
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) throw new Error('Token exchange failed')

  const data = await res.json()
  const tokens: AuthTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete_id: data.athlete.id,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

export function getTokens(): AuthTokens | null {
  const raw = localStorage.getItem(TOKEN_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function refreshIfNeeded(tokens: AuthTokens): Promise<AuthTokens> {
  if (Date.now() / 1000 < tokens.expires_at - 60) return tokens

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) throw new Error('Token refresh failed')

  const data = await res.json()
  const refreshed: AuthTokens = {
    ...tokens,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(refreshed))
  return refreshed
}

async function apiFetch<T>(path: string): Promise<T> {
  const tokens = getTokens()
  if (!tokens) throw new Error('Not authenticated')

  const fresh = await refreshIfNeeded(tokens)
  const res = await fetch(`https://www.strava.com/api/v3${path}`, {
    headers: { Authorization: `Bearer ${fresh.access_token}` },
  })

  if (!res.ok) throw new Error(`Strava API error: ${res.status}`)
  return res.json()
}

export async function getRecentActivities(): Promise<StravaActivity[]> {
  return apiFetch<StravaActivity[]>('/athlete/activities?per_page=20')
}

export async function getActivity(id: number): Promise<StravaDetailedActivity> {
  return apiFetch<StravaDetailedActivity>(`/activities/${id}`)
}

export function formatDistance(meters: number, type: string): string {
  const km = meters / 1000
  const isRun = type.toLowerCase().includes('run')
  if (km < 1) return `${Math.round(meters)}m`
  return isRun ? `${km.toFixed(2)} km` : `${km.toFixed(1)} km`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
