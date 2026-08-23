import { NextResponse } from "next/server";
import { validatePublicUrl } from "@/lib/audit";

export const runtime = "nodejs";

function mediaName(value: string) {
  return value.startsWith("places/") && value.includes("/photos/") ? value : "";
}

export async function GET(request: Request) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const url = new URL(request.url);
  const source = url.searchParams.get("src") || "";
  const placePhoto = mediaName(source);

  if (!source) return NextResponse.json({ error: "Image source is required." }, { status: 400 });

  try {
    let target = "";
    if (placePhoto) {
      if (!key) return NextResponse.json({ error: "Google Places is not configured." }, { status: 503 });
      target = `https://places.googleapis.com/v1/${placePhoto}/media?maxWidthPx=1600&maxHeightPx=1200&key=${encodeURIComponent(key)}`;
    } else {
      target = validatePublicUrl(source).toString();
    }

    const response = await fetch(target, {
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "SolProvo-Prospect-Preview/0.1 (+https://solprovo.in)",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) return new NextResponse(null, { status: response.status });
    const type = response.headers.get("content-type") || "image/jpeg";
    if (!type.toLowerCase().startsWith("image/")) return new NextResponse(null, { status: 415 });

    return new NextResponse(await response.arrayBuffer(), {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
