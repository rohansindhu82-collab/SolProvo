# Creator OS

Local-first AI content operating system for a multi-channel YouTube + blog portfolio.

## Builds 02–04

Creator OS now has a continuous research-to-production chain:

`discovery → source vault → claim ledger → evidence matrix → conflicts → thesis → narrative → script → visual registry → rights QA → human approval`

### Build 02 — Research Intelligence

- persistent SQLite research vault
- YouTube discovery connector
- Google News RSS discovery
- direct source ingestion
- candidate claim extraction
- source-to-claim provenance
- optional Ollama planning

### Build 03 — Narrative Intelligence

- source authority tiers
- evidence-weighted claim matrix
- contradiction detection
- original narrative angles and hooks
- causal narrative arc
- sentence-level citation plan
- shot plan with visual provenance
- thumbnail, Shorts and blog derivatives
- versioned narrative packages

### Build 04 — Production Intelligence

- evidence-linked script blueprint
- sentence → claim mapping
- uncertainty/review handling
- Hindi voice direction plan
- visual asset registry
- original vs external visual provenance
- human rights-clearance gate
- deterministic production QA
- explicit human approval endpoint
- versioned production packages

## Run Build 04

```bash
python3 creator_os_build04.py
```

Open `http://127.0.0.1:8787`.

## Build 04 API

- `POST /api/narrative/build`
- `GET /api/narrative/latest?topic_id=...`
- `POST /api/production/build`
- `GET /api/production/latest?topic_id=...`
- `GET /api/production/qa?topic_id=...`
- `POST /api/production/rights`
- `POST /api/production/approve`

## Product principles

1. Learn from audience demand, not from copying another creator.
2. Discovery results are signals, not evidence.
3. Claims remain untrusted until source-backed and reviewed.
4. Primary/authoritative sources are preferred for factual documentaries.
5. Provenance is preserved from source → claim → narrative → script → visual.
6. External visual assets require rights clearance before publish readiness.
7. AI assists research and production; it does not silently publish.
8. One master research package feeds documentary, Shorts, blog and social derivatives.

## Safety of the production pipeline

Creator OS deliberately refuses to treat generated text as evidence. It does not invent sources or silently clear third-party visual rights. A production package can be technically complete while still being blocked from publishing until a human resolves outstanding evidence or rights checks.

## Next

Build 05 should be the Media & Render Engine: asset ingestion, image/video/audio provenance, timeline assembly, captions, voice/render adapters, deterministic preflight and export manifests. Platform upload and analytics should come after the production core is reliable.
