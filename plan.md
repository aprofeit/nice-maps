# Nice Maps — Build Plan

## What We're Building

A Vite + React SPA that connects to Strava, lets you pick a recent activity, and renders a styled map with the route overlaid. Export as a transparent PNG sized for Instagram stories (1080×1920). No backend — fully client-side.

---

## Stack

- **Vite + React + TypeScript**
- **Maplibre GL JS** — map rendering
- **MapTiler** — vector tile provider (API key required)
- **Strava OAuth (PKCE)** — client-side auth, no server needed
- **Vercel** — static hosting

---

## Map Styles

Three styles, all export with transparent background and a bold route overlay.

### Ghost
- Near-monochrome, washed-out palette
- Only major roads, water bodies, and coastlines visible
- Labels removed or minimal
- The route is the focus — everything else recedes
- Best for: clean editorial look, any activity type

### Terrain
- Natural earth tones (greens, browns, tans)
- Hillshade + contour lines for elevation
- Medium detail: trails, parks, waterways
- Labels for notable features only
- Best for: trail runs, mountain rides, hilly routes

### Blueprint
- Dark navy background
- Fine white/cyan linework for streets
- Full street network visible but stylized
- No label clutter
- Best for: urban runs and rides, dense city routes

### Route Rendering (all styles)
- Thick stroke (6–8px at export resolution)
- Bright accent color (white or a vivid pop color TBD)
- Subtle outer glow for depth
- Semi-transparent map layer (map opacity ~80%, full route opacity)

---

## App Flow

1. **Landing** — "Connect Strava" button
2. **OAuth** — PKCE flow, token stored in localStorage
3. **Activity List** — Last 20 activities, showing name, date, distance, type
4. **Map View** — Activity selected → map renders with route, style picker on screen
5. **Export** — "Download PNG" button → 1080×1920 transparent PNG

---

## Key Technical Details

- `preserveDrawingBuffer: true` on the Maplibre map instance (required for canvas export)
- Map background set to `transparent` in the style spec
- Export uses `map.getCanvas().toDataURL('image/png')` at native resolution
- PKCE OAuth: generate code verifier/challenge in browser, exchange code for token via Strava token endpoint
- Strava polyline decoded client-side (use `@mapbox/polyline` or similar)
- Route fit: `map.fitBounds()` with padding to frame the activity nicely

---

## Credentials Needed

| Credential | Where to get it |
|---|---|
| MapTiler API Key | maptiler.com → Account → API Keys |
| Strava Client ID | strava.com/settings/api |
| Strava Client Secret | strava.com/settings/api |

All stored in `.env.local` during dev, Vercel env vars in production.

---

## Project Structure

```
nice-maps/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Activities.tsx
│   │   └── MapView.tsx
│   ├── components/
│   │   ├── MapCanvas.tsx
│   │   ├── StylePicker.tsx
│   │   └── ExportButton.tsx
│   ├── lib/
│   │   ├── strava.ts       — OAuth + API calls
│   │   ├── styles.ts       — Maplibre style definitions
│   │   └── export.ts       — PNG export logic
│   └── types.ts
├── .env.local
├── index.html
└── vite.config.ts
```

---

## Build Order

1. Scaffold Vite + React + TS project
2. Wire up Strava PKCE OAuth (connect → callback → token)
3. Fetch and display recent activities list
4. Render map with decoded polyline (single style first)
5. Add style switcher (Ghost → Terrain → Blueprint)
6. PNG export with transparency
7. Polish: loading states, fit bounds, route glow
8. Deploy to Vercel
