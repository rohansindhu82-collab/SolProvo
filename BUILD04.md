# Creator OS Build 04 — Production Intelligence

Build 04 is the production-control layer between research/narrative and publishing.

## Pipeline

`source → claim → narrative section → script sentence → visual asset → rights check → QA → human approval`

## Script controls

- factual sentences carry claim IDs
- unmapped factual claims fail QA
- uncertain evidence stays explicitly marked for review
- no automatic invention of facts, sources or archival material

## Visual controls

- creator-original diagrams can pass provenance automatically
- external/source visuals require human rights clearance
- pending visual rights block publish readiness
- every visual records which claims it supports

## QA gates

1. Sentence/claim mapping
2. No unmapped claim IDs
3. Duplicate sentence check
4. Visual rights clearance
5. Publish-ready state

## Human gate

`POST /api/production/approve` is intentionally blocked unless every QA gate passes. Approval is recorded with timestamp and `human_operator` marker.

## Endpoints

- `POST /api/narrative/build`
- `GET /api/narrative/latest?topic_id=...`
- `POST /api/production/build`
- `GET /api/production/latest?topic_id=...`
- `GET /api/production/qa?topic_id=...`
- `POST /api/production/rights`
- `POST /api/production/approve`

This build does not upload or publish to third-party platforms.
