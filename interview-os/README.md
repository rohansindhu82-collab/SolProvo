# Interview OS

A polished browser-first AI mock interview simulator. The first vertical is **TGT Librarian**.

## What is working

- Role selector: TGT Librarian and TGT Teacher starter profiles
- Interview modes: Practice, Realistic, Pressure
- Camera + microphone permission flow
- Browser speech recognition where supported
- AI-style interviewer voice using browser speech synthesis
- Adaptive session shell and progress tracking
- Observable camera framing / presence signals
- Speech duration and answer-quality scoring
- Detailed post-interview readiness report
- Strengths, improvements and personalised retry questions
- Responsive dark interface designed for desktop and mobile

## Run

This is a static web app. Open `index.html` from a secure origin (localhost or HTTPS) so camera/microphone permissions work.

For local development, for example:

```bash
cd interview-os
python3 -m http.server 8787
```

Then open `http://localhost:8787`.

## Product guardrails

Interview OS evaluates observable communication behaviour. It does **not** infer honesty, personality, intelligence, emotion, attractiveness, protected traits or hiring-worthiness from facial appearance. Visual metrics are coaching aids, not psychological judgements.

## Production architecture

The next production layer should replace the local question adapter with a server-side interview orchestration API:

`Exam Profile → Question/Rubric Engine → Multimodal Interviewer → Transcript → Vision Metrics → Evidence-based Scoring → Report → Personalised Practice`

The exam profile should contain question pools, competency weights, follow-up rules, difficulty bands and evaluation rubrics. The same engine can then support KVS/NVS, TGT/PGT, banking, UPSC-style personality interviews and corporate roles without duplicating the product.

## Important implementation note

The current static build is intentionally usable without API keys. It provides a strong end-to-end UX and browser baseline. For a production AI release, connect the interviewer and evaluator to a server-side model gateway, add persistent sessions, robust vision landmark inference, consent/retention controls, and deterministic scoring validation before exposing AI scores as authoritative.
