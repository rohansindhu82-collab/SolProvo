# SolProvo

**India-first local business growth operating system.**

SolProvo is being built in two layers:

- **ProspectOS** — our internal acquisition engine: discover businesses, analyze their public digital presence, identify genuine customer-journey gaps, score opportunities, and generate personalized demos.
- **BusinessOS** — the product sold to local businesses: leads, customers, appointments, offers, follow-ups, reviews, messaging and AI assistance.

## Current milestone: ProspectOS v0.1

The first vertical is **Indian real estate**, starting with Noida / Greater Noida / Ghaziabad / Dadri. Dental clinics are the second vertical.

### Current MVP

- Prospect dashboard
- Evidence-first website analyzer
- Industry-aware opportunity engine
- Live Google Places Text Search (New) discovery connector
- Batch website auditing
- Real-estate demo factory
- Responsive local-business-focused UI
- CI production-build verification

## Live discovery setup

SolProvo uses the official **Google Places API (New) Text Search** for business discovery rather than scraping Google Maps. Google requires an API key and a response field mask for Text Search (New). citehttps://developers.google.com/maps/documentation/places/web-service/text-search

1. In Google Cloud, enable **Places API (New)** and create a server-side API key.
2. Restrict the key to the APIs/environments you need.
3. Create `.env.local` from `.env.example`.
4. Add:

```env
GOOGLE_PLACES_API_KEY=your_server_side_key
```

5. Restart Next.js:

```bash
npm install
npm run dev
```

Then open `/discovery` and search, for example:

- `real estate agents` + `Greater Noida`
- `property dealers` + `Noida`
- `dental clinics` + `Ghaziabad`

Businesses returned by discovery are then passed through the same evidence-based website analyzer. Missing evidence is reported as **not detected on the analyzed page**, not as proof that a business does not have the feature internally.

## Product principles

1. **Do not sell AI. Sell outcomes.**
2. **Never invent a business gap.** Every audit signal must eventually be backed by evidence.
3. **AI is infrastructure, not the visual identity.**
4. **India-first UX:** simple, WhatsApp-friendly, Hindi/Hinglish-ready and affordable.
5. **Compliance-first acquisition:** no indiscriminate automated calling or messaging.
6. **Personalized demos beat generic agency websites.**
7. **Google Places is a discovery source, not a scraped contact database.**

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Security baseline

The project pins a patched Next.js/React baseline. Keep dependencies updated and treat production CI as a hard quality gate. Never commit `.env.local`, API keys, Firebase credentials, or other secrets.
