# Auth and Sessions

## Current state

The project currently supports Tractive authentication most reliably through **imported real sessions** rather than direct login emulation.

## Recommended auth strategy

### Preferred path
1. log into the real Tractive website in a browser
2. capture the session JSON from the authenticated web state
3. import that session into the wrapper/test app
4. call `verify()` to confirm it is still valid
5. save and reuse that verified session locally

### Why this is the preferred path
Because it works now.

This approach has already been validated with the wrapper and UI.

## Session shape
Observed authenticated session shape:

```json
{
  "user_id": "<user_id>",
  "client_id": "<client_id>",
  "expires_at": 1777199338,
  "access_token": "<access_token>",
  "scope": null
}
```

## Session sources supported by the test app

### 1. Imported session file
Env var:
- `TRACTIVE_SESSION_FILE`

This should point to a JSON file with the session object.

### 2. Inline session JSON
Env var:
- `TRACTIVE_SESSION_JSON`

Useful for automation or quick experiments.

### 3. Saved session file
The test app can save a verified session locally and reuse it.

Current local store path:
- `.tractive-session.json` inside `packages/test-app`

## Verification flow
The wrapper uses:
- `GET /3/auth/verify`

If the imported/saved session verifies successfully:
- it is treated as the current active session
- it can be saved back for reuse

If verification fails:
- the session is treated as expired/invalid
- the app falls back to the next available auth path

## Direct login status

### What has been confirmed
The website uses:
- `POST /3/auth/token`

Observed request body:

```json
{
  "platform_email": "<email>",
  "platform_token": "<password>",
  "grant_type": "tractive",
  "locale": "<optional locale>"
}
```

### What happens in the wrapper right now
Direct login attempts currently fail with a Tractive security/client rejection.

Observed error pattern:
- HTTP `403`
- code `8003`
- category `SECURITY`
- message roughly equivalent to:
  - `The client is invalid or not allowed to perform this action.`

### Interpretation
The remaining issue is likely not basic payload shape.
It is more likely one or more of:
- app/client identity mismatch
- missing request metadata
- website-only flow expectations
- additional anti-abuse checks around login

## Guidance

### For humans
Use real imported sessions for now.

### For LLMs
Do not claim login emulation is solved.
Treat it as unfinished unless new evidence proves otherwise.

## Security notes
- Do not commit real session JSON files to git.
- Do not paste real access tokens into public docs.
- Treat `.env`, imported session files, and saved session files as sensitive local runtime data.
