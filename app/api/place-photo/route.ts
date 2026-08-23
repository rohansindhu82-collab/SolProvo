import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Google Places is not configured." }, { status: 503 });
  const name = new URL(request.url).searchParams.get("name")?.trim();
  if (!name || !/^places\/[^/]+\/photos\/[^/]+$/.test(name)) return NextResponse.json({ error: "Invalid photo reference." }, { status: 400 });
  const response = await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=1400&key=${encodeURIComponent(apiKey)}`, { cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Unable to load Maps photo." }, { status: response.status });
  const contentType = response.headers.get("content-type") || "image/jpeg";
  return new Response(await response.arrayBuffer(), { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" } });
}
