# Tractive API Reference

This document is an implementation-facing reference for the Tractive web/API surface discovered so far.

It is intended for:
- engineers building on the wrapper
- LLMs continuing the reverse-engineering or implementation work
- humans who want a concise map of the known API without reading the full research narrative

## Confidence levels

### Validated
Observed directly through live authenticated requests and/or working wrapper behavior.

### Strongly supported
Seen in the official web bundle, UI behavior, or wrapper tests, but not always exhaustively exercised in every variant.

### Inferred
Likely correct from bundle patterns or surrounding evidence, but should still be treated cautiously.

## Base hosts

### Web app
- `https://my.tractive.com/`

### Graph/API host
- `https://graph.tractive.com`

### Realtime/channel host
- `https://channel.tractive.com/3`

### Other observed hosts
- `https://cdn.tractive.com`
- `https://resource.tractive.com`

## Auth and session

## Session shape
**Validated**

```json
{
  "user_id": "<user_id>",
  "client_id": "<client_id>",
  "expires_at": 1777199338,
  "access_token": "<access_token>",
  "scope": null
}
```

## Session storage on official web app
**Validated**
- localStorage key: `store.session`

## Headers

### Common authenticated headers
**Validated**
- `Authorization: Bearer <access_token>`
- `X-Tractive-Client: <client_id>`
- `Accept: application/json`

### App identity headers
**Strongly supported**
- `X-Tractive-App: site.tractivegps`
- `X-Tractive-AppBuild: <build>`
- `X-Tractive-AppVersion: <version>`

## Auth endpoints

### Verify session
- `GET /3/auth/verify`
- Confidence: **Validated**
- Current wrapper support: **yes**

### Email/password login
- `POST /3/auth/token`
- Confidence: **Validated endpoint + payload shape; direct emulation still unreliable**
- Observed request body:
```json
{
  "platform_email": "<email>",
  "platform_token": "<password>",
  "grant_type": "tractive",
  "locale": "<optional locale>"
}
```
- Notes:
  - official web app uses this
  - wrapper-side direct login currently receives client/security rejection
  - treat as unfinished/experimental for now

### Google login
- `POST /3/auth/token/google`
- Confidence: **Strongly supported**
- Observed body shape:
```json
{
  "auth_code": "<oauth code>",
  "locale": "<locale>",
  "all_terms_accepted": true
}
```

### Other auth endpoints
- `POST /3/auth/register`
- `POST /3/auth/reset`
- `POST /3/auth/logout`
- `POST /3/auth/logout_from_all_devices`
- Confidence: **Strongly supported**

## Graph API patterns

These generic patterns are fundamental to the web/API design.

### Object load
- `GET /3/{type}/{id}`
- Confidence: **Validated**
- Wrapper support: **yes**

### Relation load
- `GET /3/{type}/{id}/{relation}`
- Confidence: **Validated**
- Wrapper support: **yes**

### Update
- `PUT /3/{type}/{id}?_version={version}`
- Confidence: **Strongly supported**
- Wrapper support: **yes**

### Delete
- `DELETE /3/{type}/{id}`
- Confidence: **Strongly supported**

### Create (bundle pattern)
- `POST /3/{childType}/{parentType}/{relation}/{parentId}`
- Confidence: **Strongly supported**

### Bulk
- `POST /3/bulk?partial=1`
- Confidence: **Validated**
- Wrapper support: **yes**
- Request body example:
```json
[
  {"_type":"tracker","_id":"TRACKER_ID_EXAMPLE"},
  {"_type":"pet","_id":"PET_ID_EXAMPLE"}
]
```

## User/account endpoints

### User object
- `GET /3/user/{user_id}`
- Confidence: **Validated**
- Wrapper support: **yes**

### User trackers
- `GET /3/user/{user_id}/trackers`
- Confidence: **Validated**
- Wrapper support: **yes**

### User trackable objects
- `GET /3/user/{user_id}/trackable_objects`
- Confidence: **Validated**
- Wrapper support: **yes**

### User subscriptions
- `GET /3/user/{user_id}/subscriptions`
- Confidence: **Validated**
- Wrapper support: **yes**

### User shares
- `GET /3/user/{user_id}/shares`
- Confidence: **Validated**
- Wrapper support: **yes**

### Misc user/account endpoints
- `GET /3/user/me/subscriptions/upgradeorder`
- `POST /3/user/check_if_email_exists`
- `POST /3/user/{user_id}/resend_email_verification`
- `POST /3/user/me/activate`
- `POST /3/user/me/picture`
- Confidence: **Strongly supported** or **validated** depending on endpoint

## Pet / trackable object endpoints

### Pet object
- `GET /3/pet/{pet_id}`
- Confidence: **Validated**
- Wrapper support: **yes**

### Trackable object
- `GET /3/trackable_object/{trackable_id}`
- Confidence: **Strongly supported**
- Wrapper support: **yes**

### Update trackable object
- `PUT /3/trackable_object/{trackable_id}?_version={version}`
- Confidence: **Strongly supported**

### Create pet
- `POST /3/pet/user/trackable_objects/{user_id}`
- Confidence: **Strongly supported**

### Upload trackable object picture
- `POST /3/trackable_object/{trackable_id}/picture`
- Confidence: **Strongly supported**

### Human-readable pet name
**Validated**
- field: `pet.details.name`
- Example from real data: `PET_NAME_EXAMPLE`

## Tracker endpoints

### Tracker object
- `GET /3/tracker/{tracker_id}`
- Confidence: **Validated**
- Wrapper support: **yes**

### Device position report relation
- `GET /3/tracker/{tracker_id}/device_pos_report`
- Confidence: **Validated**
- Notes:
  - relation may return a reference array
  - wrapper currently dereferences the first returned object into full `device_pos_report`

### Device hardware report relation
- `GET /3/tracker/{tracker_id}/device_hw_report`
- Confidence: **Validated**
- Notes:
  - relation may return a reference array
  - wrapper currently dereferences the first returned object into full `device_hw_report`

### Geofences for tracker
- `GET /3/tracker/{tracker_id}/geofences`
- Confidence: **Validated**
- Wrapper support: **yes**

### Position range / history family
- `GET /3/tracker/{tracker_id}/positions/range`
- Confidence: **Validated endpoint family**
- Wrapper support: **not yet productized**

### Export family
- `GET /3/tracker/{tracker_id}/positions/export?time_from={ts}&time_to={ts}&format={fmt}`
- `GET /3/tracker/{tracker_id}/positions/export/{export_id}/status`
- `GET /3/tracker/{tracker_id}/positions/export/{export_id}/{download_id}?format={fmt}`
- Confidence: **Strongly supported / validated family**

## Tracker command endpoints

These align closely with the official Tractive map UI controls.

### Live tracking
- `GET /3/tracker/{tracker_id}/command/live_tracking/on`
- `GET /3/tracker/{tracker_id}/command/live_tracking/off`
- Confidence: **Validated**
- Wrapper support: **yes**
- UI support: **yes**

### LED / Light
- `GET /3/tracker/{tracker_id}/command/led_control/on`
- `GET /3/tracker/{tracker_id}/command/led_control/off`
- Confidence: **Validated**
- Wrapper support: **yes**
- UI support: **currently on only**

### Buzzer / Sound
- `GET /3/tracker/{tracker_id}/command/buzzer_control/on`
- `GET /3/tracker/{tracker_id}/command/buzzer_control/off`
- Confidence: **Validated**
- Wrapper support: **yes**
- UI support: **currently on only**

### Position request
- `GET /3/tracker/{tracker_id}/command/pos_request/on`
- Confidence: **Validated**
- Wrapper support: **via generic graph relation in UI server; should be wrapped more cleanly later**
- UI support: **yes**

### Live tracking timeout
- `PUT /3/tracker/{tracker_id}/lt_timeout`
- Confidence: **Strongly supported / validated**
- Wrapper support: **not yet exposed as a polished method**

### Reactivation
- `POST /3/tracker/{tracker_id}/request_reactivation`
- Confidence: **Strongly supported**

## Tracker state / capabilities fields of note

Observed tracker fields include:
- `model_number`
- `hw_edition`
- `fw_version`
- `state`
- `state_reason`
- `charging_state`
- `battery_state`
- `custom_lt_timeout`
- `supported_geofence_types`
- `capabilities[]`

Observed capabilities include:
- `LT`
- `BUZZER`
- `LT_BLE`
- `LED_BLE`
- `BUZZER_BLE`
- `HW_REPORTS_BLE`
- `WIFI_SCAN_REPORTS_BLE`
- `LED`
- `ACTIVITY_TRACKING`
- `WIFI_ZONE`
- `SLEEP_TRACKING`
- `VITALITY_TRACKING`
- `LOW_POWER_MODE`

## Geofence endpoints

### Geofence object
- `GET /3/geofence/{geofence_id}`
- Confidence: **Strongly supported**

### Create geofence
- `POST /3/geofence/tracker/geofences/{tracker_id}`
- Confidence: **Strongly supported**

### Update geofence
- `PUT /3/geofence/{geofence_id}?_version={version}`
- Confidence: **Strongly supported**

### Delete geofence
- `DELETE /3/geofence/{geofence_id}`
- Confidence: **Strongly supported**

## Subscription/payment endpoints

### Subscription object
- `GET /3/subscription/{subscription_id}`
- Confidence: **Validated**
- Wrapper support: **yes**

### Renewal information
- `GET /3/subscription/{subscription_id}/renewal_information`
- Confidence: **Validated**
- Wrapper support: **yes**

### Other subscription/payment family endpoints
- `PUT /3/subscription/{subscription_id}/{change_action}`
- `POST /3/subscription/{subscription_id}/upgrade/{target}`
- `POST /3/subscription/{subscription_id}/upgrade/add_care`
- `GET /3/subscription/{subscription_id}/upgrade/info`
- `GET /3/payment/plans?...`
- `GET /3/payment/additional_service_plans?...`
- `GET /3/payment/roaming?...`
- `POST /3/payment/tracker/{tracker_id}/activate`
- `GET /3/payment/tracker/{tracker_id}/status`
- `GET /3/payment/tracker/{tracker_id}/flow?...`
- `POST /3/payment/checkout`
- `POST /3/payment/adyen/complete/{arg1}/{arg2}`
- `POST /3/payment/voucher/{voucher}`
- Confidence: **Strongly supported / partially validated**

## Shares / public resources

- `GET /3/share/{share_id}`
- `POST /3/share/{share_id}/decline`
- `POST /3/share/{share_id}/cancel`
- `GET /3/resource/{resource_id}`
- `GET /3/resource/{resource_id}/live-trace`
- `GET /3/resource/{resource_id}/live-position`
- Confidence: **Strongly supported / partially validated**

## Realtime channel API

## Transport
**Validated**

The official web app uses an authenticated long-lived HTTP POST stream, not a standard WebSocket in the observed code path.

### Open channel
- `POST https://channel.tractive.com/3/channel`
- Confidence: **Validated**
- Wrapper support: **yes**

Required/observed headers:
- `Authorization: Bearer <access_token>`
- `Accept: application/json`
- `Content-Type: application/json`
- `X-Tractive-Client: <client_id>`
- `X-Tractive-App: site.tractivegps`

### Subscribe to tracker status
- `POST /3/subscription/{channel_id}/tracker_status`
- Confidence: **Validated / strongly supported**
- Wrapper support: **yes**

### Subscribe to graph sync
- `POST /3/subscription/{channel_id}/graph_sync`
- Confidence: **Strongly supported**
- Wrapper support: **yes**

## Realtime message types

### Handshake
```json
{
  "message": "handshake",
  "channel_id": "channel-...",
  "persistant": false,
  "keep_alive_ttl": 600
}
```

### Keep-alive
```json
{
  "message": "keep-alive",
  "channelId": "channel-...",
  "keepAlive": 1776595524
}
```

### Tracker status
Observed fields include:
- `tracker_id`
- `tracker_state`
- `tracker_state_reason`
- `position`
- `hardware`
- `led_control`
- `buzzer_control`
- `live_tracking`
- `charging_state`
- `battery_state`

### Graph sync
Observed fields include:
- `user_id`
- `targets[]`

## Command/control-state model notes

The official UI also appears to model control-state objects such as:
- `tracker_command_state`

Expected fields/hints include:
- `active`
- `pending`
- `reconnecting`
- `started_at`
- `timeout`
- `remaining`

These have not yet been fully productized in the wrapper.

## Current wrapper mapping summary

### Already exposed cleanly
- session verify
- object load / relation load / bulk / update
- users
- pets
- trackers
- subscriptions
- realtime channel open + subscription + event iteration
- tracker commands for live tracking / LED / buzzer

### Exposed but still rough
- position request via generic relation call in UI server
- direct login emulation
- history route API
- geofence CRUD
- payment / shares / public resources

## Recommended next API-facing work

1. add typed tracker, pet, session, and event models
2. add `requestPosition()` as a first-class tracker method
3. add history/range fetch as a first-class tracker method
4. add Light Off / Sound Off to UI
5. add geofence read + overlay support in UI
6. add accuracy-circle support using `position.accuracy`
