import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = new URL(request.url).searchParams.get("placeId") || "";
  if (!key || !placeId || placeId.startsWith("manual:")) return NextResponse.json({ photos: [] });

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "photos.name,photos.widthPx,photos.heightPx",
      },
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ photos: [] }, { status: response.status });
    const photos = Array.isArray(data?.photos)
      ? data.photos.map((photo: any) => photo?.name).filter(Boolean).slice(0, 8)
      : [];
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
