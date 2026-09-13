# Creator OS

Local-first AI content operating system for a multi-channel YouTube + blog portfolio.

## Build 02 — Research Intelligence

This build establishes the evidence layer before automated production:

- persistent SQLite research vault
- topic records and production contracts
- optional official YouTube Data API discovery
- Google News RSS discovery without a paid API
- direct web-source ingestion
- candidate claim extraction with `needs_review` status
- source-to-claim provenance
- optional local Ollama planning
- human approval remains mandatory before publishing

### Run

```bash
python3 creator_os.py
```

Open `http://127.0.0.1:8787`.

### Optional connectors

```bash
export YOUTUBE_API_KEY=your_key
export YOUTUBE_REGION=IN
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export OLLAMA_MODEL=qwen2.5:7b
python3 creator_os.py
```

## Product principles

1. Learn from audience demand, not from copying another creator.
2. A discovery result is a signal, not evidence.
3. Claims are untrusted until source-backed and reviewed.
4. Primary/authoritative sources are preferred for factual documentaries.
5. Provenance is stored so every factual sentence can eventually point back to evidence.
6. AI assists research and production; it does not silently publish.
7. The same master research package will later feed documentary video, Shorts, blog and social derivatives.

## Roadmap

Build 03 will connect the source graph to the narrative engine: evidence-weighted brief → original Hindi script → claim-to-sentence mapping → shot plan → asset provenance → QA. Later builds add rendering, YouTube OAuth/upload, analytics feedback and blog publishing.
