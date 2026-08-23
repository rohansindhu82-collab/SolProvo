import { NextResponse } from "next/server";
import { auditWebsite } from "@/lib/audit";
import { buildBusinessIntelligence } from "@/lib/business-intelligence";

export const runtime = "nodejs";

async function mapsDetails(placeId: string) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || !placeId || placeId.startsWith("manual:")) return {};
  const fieldMask = ["id","displayName","formattedAddress","websiteUri","googleMapsUri","types","businessStatus","nationalPhoneNumber","internationalPhoneNumber","photos.name","rating","userRatingCount","regularOpeningHours","reviews"].join(",");
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, { headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": fieldMask }, cache: "no-store" });
  if (!response.ok) return {};
  const p = await response.json();
  return { name: p.displayName?.text, address: p.formattedAddress, website: p.websiteUri, mapsUrl: p.googleMapsUri, phone: p.internationalPhoneNumber || p.nationalPhoneNumber, types: p.types, businessStatus: p.businessStatus, photoNames: Array.isArray(p.photos) ? p.photos.map((x: any) => x.name).filter(Boolean).slice(0, 8) : [], rating: p.rating, reviewCount: p.userRatingCount, hours: p.regularOpeningHours?.weekdayDescriptions || [], reviews: p.reviews || [] };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.name && !body?.placeId) return NextResponse.json({ error: "Business name or place ID is required." }, { status: 400 });
    const maps = await mapsDetails(typeof body.placeId === "string" ? body.placeId : "");
    const merged = { ...body, ...maps, name: maps.name || body.name, address: maps.address || body.address, website: maps.website || body.website, mapsUrl: maps.mapsUrl || body.mapsUrl, phone: maps.phone || body.phone };
    let websiteAudit: any = body.websiteAudit || null;
    let websiteText = typeof body.websiteText === "string" ? body.websiteText : "";
    if (!websiteAudit && typeof merged.website === "string" && merged.website.trim()) {
      try { websiteAudit = await auditWebsite(merged.website.trim()); websiteText = websiteAudit.description || ""; } catch { websiteAudit = { images: [], signals: [], title: "", description: "", finalUrl: merged.website }; }
    }
    const intelligence = buildBusinessIntelligence({ ...merged, websiteAudit, websiteText });
    return NextResponse.json({ intelligence });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build business intelligence." }, { status: 400 }); }
}
