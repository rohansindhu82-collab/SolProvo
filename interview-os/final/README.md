# Interview OS — Final Build

A browser-first interview simulator for structured practice, transparent scoring, adaptive follow-ups, and session reports.

## Product architecture

`UI → speech/camera inputs → deterministic rubric engine → adaptive follow-up → session report`

The evaluation engine is intentionally deterministic and inspectable. An AI provider can be added later behind a server-side adapter without changing the scoring contract or exposing API keys in the browser.

## What is included

- TGT Librarian and TGT Teacher profiles
- Practice, Realistic, and Pressure modes
- Browser microphone + speech recognition where supported
- Spoken questions using browser speech synthesis
- Six-dimension answer rubric: relevance, knowledge, structure, specificity, communication, completeness
- Adaptive follow-up prompts driven by the weakest rubric dimension
- Readiness score and per-dimension report
- Local-first browser flow; no answer is uploaded by this static build
- Clear distinction between observable coaching signals and sensitive inference

## Run

Open `index.html` in a modern browser. Microphone/camera permissions may require HTTPS or localhost depending on browser security rules.

For production, serve this directory over HTTPS and add a server-side AI adapter for richer semantic evaluation. Never place provider API keys in `app.js`.

## Extension contract

`profiles.js` owns role-specific questions and evidence keywords. `engine.js` owns transparent scoring and follow-up selection. A future backend can replace or augment semantic scoring while preserving these UI contracts.
