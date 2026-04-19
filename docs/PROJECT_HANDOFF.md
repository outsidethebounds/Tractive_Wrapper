# Tractive Project Handoff

This document is the high-level handoff for both humans and LLMs.

## Objective
Build a usable Tractive wrapper and inspector application by reverse-engineering the public web app and (secondarily) the Android app.

## Current deliverables

### Research deliverables
Web/API research lives in:
- `../tractive/notes/web-api-research.md`
- `../tractive/data/web-endpoints.json`
- `../tractive/notes/wrapper-design-spec.md`
- `../tractive/data/wrapper-methods.json`

Android static findings live in:
- `../tractive-mobile/notes/android-static-findings.md`
- `../tractive-mobile/data/android-hosts-and-ble.json`

### Implementation deliverables
Implementation lives in this workspace:
- `packages/client`
- `packages/test-app`

## What is proven

### Proven on the web/API side
- main API host is `https://graph.tractive.com`
- realtime host is `https://channel.tractive.com/3`
- authenticated session shape from web localStorage is valid
- graph-style resource access works
- realtime channel open + subscription + event parsing works
- command endpoints exist and align with official UI actions

### Proven in the wrapper/test app
- imported session can be verified
- verified session can be reused/saved
- tracker list fetch works
- pet fetch works
- full pet object resolution works (`pet.details.name` contains human-readable pet name)
- tracker detail fetch works
- position/hardware report dereferencing works
- realtime tracker status stream works
- local map UI can render and update from live coordinates

## Current known limitations

### 1. Direct login emulation is not reliable yet
The wrapper can hit `POST /3/auth/token`, but Tractive currently returns a security/client-identity rejection in our emulated flow.

Interpretation:
- the login endpoint exists
- the payload shape is likely right
- the surrounding client identity / app metadata / flow context is still not sufficiently reproduced

### 2. UI is prototype-grade
The current inspector is useful but not polished.

Missing or rough areas:
- no formal state management
- minimal error UX
- no session import UI screen yet
- no polished visual design
- controls are only partially toggle-aware

### 3. Android investigation is incomplete
Android reverse engineering proved there is meaningful BLE functionality and extra hosts, but it is not yet integrated into the wrapper implementation.

## Architecture summary

### Layer 1 — transport
- `packages/client/src/http.ts`
- `packages/client/src/channel.ts`

Responsibilities:
- authenticated requests
- header handling
- NDJSON channel handling
- raw error conversion

### Layer 2 — resource/API wrapper
- `auth.ts`
- `graph.ts`
- `resources/*.ts`
- `client.ts`

Responsibilities:
- resource-friendly methods
- graph helper semantics
- tracker and pet helpers
- command wrappers

### Layer 3 — consumer apps
- CLI test flow in `packages/test-app/src/index.ts`
- web inspector in `packages/test-app/src/server.ts` + `static/*`

Responsibilities:
- UX
- session import/reuse behavior
- operational controls
- map rendering and live stream consumption

## Recommended mental model

Treat this project as:
- a **session-first Tractive client**
- with a **map-first operator UI**
- and **direct login emulation** as unfinished / experimental

That framing is important because it keeps the current system honest.

## Most important next steps

### Product/UI
1. add Light Off and Sound Off
2. add history route overlay on map
3. add accuracy circle toggle
4. add geofence visibility / empty state
5. add Street/Satellite layer switching

### Auth
1. capture the exact login flow more deeply if login emulation still matters
2. optionally add a UI/session-import workflow (paste/upload JSON)
3. show session expiration / validity in UI

### Code quality
1. add stronger TypeScript models for tracker/pet/session/realtime events
2. add fixtures and tests
3. add reconnect/backoff handling for the UI stream path
4. document environment and runtime assumptions explicitly

## Notes for LLM continuation

If another model picks this up, it should:
1. read `../tractive/notes/web-api-research.md`
2. read `docs/AUTH_AND_SESSIONS.md`
3. read `docs/FEATURES_AND_COMMANDS.md`
4. inspect `packages/client/src/*`
5. inspect `packages/test-app/src/server.ts` and `static/app.js`

The highest-value truth sources are:
- the live web investigation notes
- the verified session-based wrapper behavior
- the current inspector UI implementation

Do not start by re-solving auth from scratch unless that is the explicit priority.
