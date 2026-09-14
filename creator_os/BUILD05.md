# Build 05 — Media & Render Engine

Pipeline: `Research → Evidence → Narrative → Script → Media Registry → Timeline → Captions → Preflight → Render Manifest → Export`

## Core
- SHA-256 asset identity and local deduplication
- FFprobe media metadata
- provenance, rights state and claim linkage
- JSON timeline / EDL-like structure
- SRT caption generation
- deterministic preflight
- FFmpeg rendering
- render manifests and output probing
- dry-run render mode
- SQLite persistence

## API
- `POST /api/media/ingest`
- `GET /api/media`
- `POST /api/captions`
- `GET /api/captions`
- `POST /api/timeline`
- `GET /api/timelines`
- `POST /api/preflight`
- `POST /api/render`
- `GET /api/health`

External assets can carry a non-approved rights state and preflight blocks rendering until rights are approved. This build never uploads or publishes content.