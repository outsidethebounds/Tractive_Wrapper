# Features and Commands

This document lists the known or validated command-style endpoints and suggests how they should appear in the UI.

## Validated / strongly supported tracker command endpoints

### Request Position
- `GET /3/tracker/{tracker_id}/command/pos_request/on`

Suggested UI:
- button: **Request Position**

Notes:
- high-value
- low-risk
- very appropriate for a map-centric UI

### Live Tracking
- `GET /3/tracker/{tracker_id}/command/live_tracking/on`
- `GET /3/tracker/{tracker_id}/command/live_tracking/off`

Suggested UI:
- **Start Live Tracking**
- **Stop Live Tracking**

Notes:
- one of the core map-focused controls
- should remain prominent

### LED / Light
- `GET /3/tracker/{tracker_id}/command/led_control/on`
- `GET /3/tracker/{tracker_id}/command/led_control/off`

Suggested UI:
- **Light** (current)
- ideally also **Light Off** or a real toggle

Notes:
- good finder-oriented feature
- should likely get explicit on/off states

### Buzzer / Sound
- `GET /3/tracker/{tracker_id}/command/buzzer_control/on`
- `GET /3/tracker/{tracker_id}/command/buzzer_control/off`

Suggested UI:
- **Sound** (current)
- ideally also **Sound Off** or a real toggle

Notes:
- useful but intrusive
- may merit confirmation depending on UX goals

## Related configuration endpoints

### Live tracking timeout
- `PUT /3/tracker/{tracker_id}/lt_timeout`

Suggested UI:
- settings popover or dropdown
- preset durations such as 5m / 15m / 30m / 60m

## Map/history endpoints of interest

### Geofences
- `GET /3/tracker/{tracker_id}/geofences`
- `POST /3/geofence/tracker/geofences/{tracker_id}`
- `PUT /3/geofence/{geofence_id}?_version={version}`
- `DELETE /3/geofence/{geofence_id}`

Suggested UI:
- **Fence** panel or drawer
- empty state when none exist
- map overlay toggle

### History / position range
Previously identified endpoint families include:
- `GET /3/tracker/{tracker_id}/positions/range`
- export/history-related position endpoints

Suggested UI:
- **History** button
- time range picker
- route polyline overlay on map

## Recommended UI control roadmap

### Phase 1 — core operator controls
- Request Position
- Start Live Tracking
- Stop Live Tracking
- Light / Light Off
- Sound / Sound Off

### Phase 2 — map usefulness
- History
- Accuracy toggle
- Recenter button
- Street / Satellite layer switch

### Phase 3 — operational overlays
- Fence panel
- geofence visibility toggle
- geofence create/edit/delete flows

## Notes from official Tractive map page
The official page for the tracker-specific map experience visibly includes:
- Light
- Sound
- Stop
- History
- Fence
- Satellite
- Street Map
- Show on map
- Device accuracy
- Virtual Fence
- Map Help

That makes a useful north star for parity planning.

## Recommendation
If prioritizing product value over completeness, build next in this order:
1. Light Off + Sound Off
2. History map overlay
3. Accuracy circle
4. Street/Satellite toggle
5. Fence visibility and management
