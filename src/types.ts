export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date: string
  distance: number
  moving_time: number
  total_elevation_gain: number
  average_speed: number
  average_heartrate?: number
  map: {
    summary_polyline: string
  }
}


export interface StravaDetailedActivity extends StravaActivity {
  map: {
    summary_polyline: string
    polyline: string
  }
}

export type MapStyle = 'ghost' | 'terrain' | 'blueprint'

export interface SizePreset {
  label: string
  width: number
  height: number
  description: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete_id: number
}
