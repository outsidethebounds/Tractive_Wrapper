# Tractive Wrapper Workspace

A TypeScript workspace for a Tractive web/API wrapper plus a small inspector app.

This folder is the current implementation handoff point for the Tractive reverse-engineering work.

## What exists now

### `packages/client`
A small TypeScript client for the Tractive web API surface.

Current capabilities:
- session-based auth (`verify`, session injection, session reuse support)
- generic graph API helpers
- user, pet, tracker, subscription resource helpers
- realtime channel open + subscribe + NDJSON event iteration
- command helpers for:
  - live tracking on/off
  - LED on/off
  - buzzer on/off

### `packages/test-app`
A small operator/test application that currently has:
- CLI modes for summary / tracker detail / stream
- local web UI (“Tractive Inspector”)
- session import and session reuse
- live map using Leaflet/OpenStreetMap
- top control bar for common tracker actions

## Important auth reality

### What works reliably
- importing a real authenticated browser session
- verifying that session with `GET /3/auth/verify`
- saving/reusing that verified session locally

### What does **not** work reliably yet
- first-principles login emulation via `POST /3/auth/token`

The current recommended auth model is therefore:
- **session-first**
- use imported session JSON from a real web login
- treat direct login emulation as a separate unfinished problem

Read `docs/AUTH_AND_SESSIONS.md` for details.

## Current status
- web/API investigation: strong
- Android static investigation: partial, useful, not fully productized
- wrapper: usable for authenticated session-based access
- inspector UI: usable on LAN, map-first, still prototype-grade

## Quick start

### Install
```bash
cd investigations/tractive-wrapper
npm install
npm run build
```

### Configure session for the test app
Create or edit:
- `packages/test-app/.env`

Supported env vars:
- `TRACTIVE_SESSION_FILE`
- `TRACTIVE_SESSION_JSON`
- `TRACTIVE_EMAIL`
- `TRACTIVE_PASSWORD`
- `PORT`
- `HOST`

Recommended current approach:
- set `TRACTIVE_SESSION_FILE` to a real captured session JSON

### Run CLI
From `investigations/tractive-wrapper`:
```bash
node --env-file=packages/test-app/.env packages/test-app/dist/index.js
node --env-file=packages/test-app/.env packages/test-app/dist/index.js trackers
node --env-file=packages/test-app/.env packages/test-app/dist/index.js tracker <TRACKER_ID>
node --env-file=packages/test-app/.env packages/test-app/dist/index.js stream <TRACKER_ID>
```

### Run local UI
From `investigations/tractive-wrapper/packages/test-app`:
```bash
HOST=0.0.0.0 node --env-file=.env dist/server.js
```

If the Mac mini LAN IP is `192.168.1.217`, the UI is reachable from another device on the same LAN at:
- `http://192.168.1.217:4173`

## Documentation map

See:
- `docs/PROJECT_HANDOFF.md` — project status, architecture, and handoff notes
- `docs/AUTH_AND_SESSIONS.md` — current auth strategy and limitations
- `docs/INSPECTOR_UI_GUIDE.md` — how to use the UI and CLI
- `docs/FEATURES_AND_COMMANDS.md` — current commands, candidate buttons, and roadmap

## Notes for future humans and LLMs

- Do **not** assume direct email/password login works from this wrapper just because the official website uses the same endpoint.
- The Tractive backend appears to enforce client/app identity rules during login.
- Imported real session + verify is currently the dependable path.
- Realtime transport is **not** standard WebSocket here; it is an authenticated long-lived HTTP POST that streams NDJSON.
- The UI is map-first on purpose; this matches the official Tractive map experience more closely than a metadata-first layout.
