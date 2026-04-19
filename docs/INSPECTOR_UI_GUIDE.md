# Inspector UI Guide

## Purpose
The Tractive Inspector is a small local operator UI for exploring trackers, pets, live events, and map position updates.

It is intentionally more like an internal console than a polished end-user product.

## Current UX principles
- map-first layout
- selected-tracker workflow
- session-first auth
- operational controls near the top
- raw details available, but not always visible

## Main UI areas

### Sidebar
Contains:
- user/session status
- tracker list
- pet list

Notes:
- trackers are selectable
- pets should display human-readable names when available
- pet name currently comes from `pet.details.name`

### Top control bar
Current controls:
- Request Position
- Start Live Tracking
- Stop Live Tracking
- Light
- Sound

Current behavior:
- acts on the currently selected tracker
- shows lightweight status text
- appends control results to the live events panel

### Main map panel
Primary focus of the app.

Current behavior:
- centers on selected tracker position when available
- updates marker from live `tracker_status.position.latlong`
- uses Leaflet with OpenStreetMap tiles

### Tracker overview panel
Condensed tracker summary, intended to avoid always showing raw metadata.

Current fields include:
- model
- state
- state reason
- battery
- charging state
- firmware
- coordinates

### Details dialog
Opened via “Open details”.

Purpose:
- shows raw tracker detail payload
- keeps the main layout cleaner while still exposing full internals

### Live events panel
Shows raw event payloads from the realtime stream.

Current uses:
- debugging
- verifying live updates
- inspecting control results

## Running the UI

From `investigations/tractive-wrapper/packages/test-app`:

```bash
HOST=0.0.0.0 node --env-file=.env dist/server.js
```

If LAN IP is known, access from another machine on the LAN via:
- `http://<LAN_IP>:4173`

## Data flow

### Summary load
`GET /api/summary`

Returns:
- trackers
- resolved pets
- user ID

### Tracker detail
`GET /api/tracker/:trackerId`

Returns:
- tracker object
- dereferenced position report
- dereferenced hardware report

### Realtime stream
`GET /api/stream?trackerId=...`

Server side:
- opens Tractive channel
- subscribes to `tracker_status`
- forwards matching events as SSE to the browser UI

### Controls
`POST /api/control`

Body:
```json
{
  "trackerId": "TRACKER_ID_EXAMPLE",
  "action": "request_position"
}
```

## Current rough edges
- controls are not fully symmetric yet (e.g. no explicit Light Off / Sound Off in UI)
- no formal reconnect UX in browser
- event panel is raw and noisy
- no history overlay yet
- no accuracy circle yet
- no map layer switcher yet
- no geofence overlay yet

## Recommended near-term UI upgrades
1. add Light Off / Sound Off
2. add history button and map route overlay
3. add accuracy circle toggle
4. add geofence visibility / empty state
5. add Street/Satellite switcher
6. add session status / expiration display
