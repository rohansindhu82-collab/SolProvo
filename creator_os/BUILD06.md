# Creator OS Build 06 — Distribution Engine

Build 06 turns a validated render into a controlled distribution package. It deliberately separates **prepare**, **human approval**, and **publish**.

## Providers
- YouTube Data API v3 via OAuth 2.0.
- WordPress REST API using an Application Password.

## Reliability gates
- Render file must exist.
- Package must be human-approved.
- Rights must be explicitly cleared.
- Metadata length is validated before publish.
- Default YouTube privacy is `private`.
- Default WordPress status is `draft`.
- Dry-run is the default for the publish endpoint.
- OAuth state is generated and checked to reduce CSRF risk.
- Credentials/tokens are never committed to the repository.

## API
- `GET /api/health`
- `GET /api/distribution`
- `GET /api/runs`
- `GET /api/youtube/auth`
- `GET /oauth/youtube/callback`
- `POST /api/distribution/prepare`
- `POST /api/distribution/publish`

## Environment
```bash
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REDIRECT_URI=http://127.0.0.1:8766/oauth/youtube/callback
```

For YouTube publishing install `google-api-python-client` and `google-auth`. Google's server-side OAuth flow is used, with a state value for CSRF protection. YouTube uploads use `videos.insert`; Google's current documentation notes that uploads from unverified API projects created after July 28, 2020 are restricted to private viewing until the project passes the required audit.

For WordPress use an Application Password rather than a normal account password.
