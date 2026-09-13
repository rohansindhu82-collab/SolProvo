# Creator OS — foundation build

A local-first AI content operating system for a multi-channel YouTube + blog portfolio.

## What is in this build
- Polished command-center UI in one file; no frontend framework required.
- SQLite persistence with channels, topics, jobs and research-source tables.
- Production Studio that creates a research contract before generation.
- Topic Lab with demand/originality/researchability/competition scoring.
- Optional local Ollama integration; core app works without any paid AI API.
- Human approval is an explicit product principle; publishing is not automatic in this foundation.

## Run
```bash
python3 creator_os.py
```
Open `http://127.0.0.1:8787`.

Optional local AI:
```bash
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export OLLAMA_MODEL=qwen2.5:7b
python3 creator_os.py
```

## Architecture direction
Research graph → claim ledger → original narrative → shot plan → voice/assets → render → QA → approval → YouTube/blog distribution → analytics feedback.

The system is deliberately not a competitor-copying machine. It can learn from what performs, while each output gets its own research, angle, claims and creative decisions.

## Next major build
Persistent research connectors + source ledger UI, YouTube discovery/analytics connector, script/shot/voice/render workers, provenance tracking, and explicit publish adapters.
