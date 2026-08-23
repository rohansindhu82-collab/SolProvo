import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.types",
  "places.businessStatus",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
].join(",");

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places is not configured. Add GOOGLE_PLACES_API_KEY to .env.local and restart the dev server." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const category = typeof body?.category === "string" ? body.category.trim() : "";
    const location = typeof body?.location === "string" ? body.location.trim() : "";
    const limit = Math.min(Math.max(Number(body?.limit) || 10, 1), 20);
    if (!category || !location) return NextResponse.json({ error: "Category and target market are required." }, { status: 400 });

    const textQuery = `${category} in ${location}, India`;
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELD_MASK },
      body: JSON.stringify({ textQuery, pageSize: limit, languageCode: "en", regionCode: "IN" }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || "Google Places discovery failed." }, { status: response.status });

    const places = Array.isArray(data?.places) ? data.places : [];
    return NextResponse.json({
      query: textQuery,
      places: places.map((place: any) => ({
        placeId: place.id || null,
        name: place.displayName?.text || "Unnamed business",
        address: place.formattedAddress || null,
        website: place.websiteUri || null,
        mapsUrl: place.googleMapsUri || null,
        phone: place.internationalPhoneNumber || place.nationalPhoneNumber || null,
        types: Array.isArray(place.types) ? place.types : [],
        businessStatus: place.businessStatus || null,
        source: "Google Places API (New)",
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Discovery failed." }, { status: 500 });
  }
}
