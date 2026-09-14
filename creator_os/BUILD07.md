# Build 07 — Analytics Intelligence

Build 07 closes the loop: **published content → performance data → evidence-backed signals → topic feedback**.

## Run
```bash
python3 creator_os_build07.py
```
Server: `http://127.0.0.1:8767`

## Real YouTube Analytics
1. In Google Cloud, enable **YouTube Analytics API**.
2. Create OAuth credentials for your app.
3. Authorize the channel with `https://www.googleapis.com/auth/yt-analytics.readonly`.
4. Supply the resulting access token as `YOUTUBE_ANALYTICS_ACCESS_TOKEN` or in the sync request.

The API query uses the `video` dimension and metrics including views, watch time, average view duration, likes, comments, shares and subscriber changes.

## Local test without Google
POST `/api/analytics/sync` with:
```json
{
  "channel_id":"UC_TEST",
  "start_date":"2026-09-01",
  "end_date":"2026-09-13",
  "sample_rows":[
    {"video":"video_a","views":12000,"watchTimeMinutes":18000,"averageViewDuration":140,"likes":700,"comments":90,"shares":50,"subscribersGained":130,"subscribersLost":4},
    {"video":"video_b","views":5000,"watchTimeMinutes":5000,"averageViewDuration":60,"likes":120,"comments":20,"shares":8,"subscribersGained":25,"subscribersLost":2}
  ]
}
```

## Interpretation guardrails
Analytics are **signals, not instructions**. Build 07 does not copy competitor scripts, invent causality, or automatically rewrite the evidence layer. It feeds aggregate performance signals back into topic planning for human review.
