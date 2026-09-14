# Final build status

The final architecture is now split into:

- `index.html` — product UI
- `profiles.js` — role blueprints
- `engine.js` — transparent deterministic scoring + adaptive follow-ups
- `server.mjs` — server-side AI evaluation adapter
- `.env.example` — provider configuration template
- `README.md` — architecture and operating notes

The browser never receives the provider API key. If `OPENAI_API_KEY` is configured on the server, `/api/evaluate` can add semantic evaluation; if it is absent, the deterministic engine remains the fallback.

OpenAI's current API documentation lists GPT-5.6 Luna as a cost-sensitive model available through the Responses API; the server defaults to that model and allows `OPENAI_MODEL` to override it. See the official OpenAI documentation before deployment for current model availability and pricing.
