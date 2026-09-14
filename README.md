# Creator OS

Local-first AI content operating system for a multi-channel YouTube + blog portfolio.

## Build 03 — Narrative Intelligence

Build 03 is a clean standalone narrative layer on top of the Build 02 research model. It converts evidence into a structured, provenance-first production package instead of generating a generic script dump.

### What it adds

- deterministic source authority tiers
- evidence-weighted claim matrix
- conservative contradiction detection
- three original narrative angles
- hook variants
- causal narrative arc
- sentence-level citation plan
- shot plan with visual provenance requirements
- thumbnail concepts
- Shorts candidates
- blog brief
- versioned narrative packages in SQLite
- explicit quality gates and mandatory human approval

### Run the clean Build 03

```bash
python3 creator_os_build03.py
```

Open `http://127.0.0.1:8787`.

Build 03 keeps the existing Build 02 server intact as `creator_os.py`; the clean server uses its own `creator_os_build03.db`.

### Optional connectors

```bash
export YOUTUBE_API_KEY=your_key
export YOUTUBE_REGION=IN
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export OLLAMA_MODEL=qwen2.5:7b
python3 creator_os_build03.py
```

## Product principles

1. Learn from audience demand, not from copying another creator.
2. A discovery result is a signal, not evidence.
3. Claims are untrusted until source-backed and reviewed.
4. Primary/authoritative sources are preferred for factual documentaries.
5. Provenance is preserved from source → claim → narrative → visual requirement.
6. Competitor content may inform demand and format signals, but is never treated as a script or asset source.
7. AI assists research and production; it does not silently publish.
8. One master research package should feed documentary video, Shorts, blog and social derivatives.

## Architecture

`discovery → source vault → claim ledger → evidence matrix → conflicts → thesis → narrative → citation plan → shot plan → derivatives → human approval`

The system is intentionally designed around originality and substantive value. YouTube's current monetization policy says mass-produced/repetitive or reused content without meaningful original value can be ineligible for monetization, so Creator OS treats originality and provenance as product-level constraints rather than after-the-fact checks.

## Roadmap

Build 04: production intelligence — script generation from the approved narrative package, sentence-level evidence attachment, Hindi/English voice plan, visual asset registry, rights/provenance checks and deterministic QA. Later: rendering, YouTube OAuth/upload, analytics feedback and blog publishing.
