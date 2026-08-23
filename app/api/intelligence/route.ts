import { NextResponse } from "next/server";
import { auditWebsite } from "@/lib/audit";
import { buildBusinessIntelligence } from "@/lib/business-intelligence";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.name) return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    let websiteAudit: any = body.websiteAudit || null;
    let websiteText = typeof body.websiteText === "string" ? body.websiteText : "";
    if (!websiteAudit && typeof body.website === "string" && body.website.trim()) {
      try {
        websiteAudit = await auditWebsite(body.website.trim());
        websiteText = websiteAudit.description || "";
      } catch (error) {
        websiteAudit = { images: [], signals: [], title: "", description: "", finalUrl: body.website };
      }
    }
    const intelligence = buildBusinessIntelligence({ ...body, websiteAudit, websiteText });
    return NextResponse.json({ intelligence });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build business intelligence." }, { status: 400 });
  }
}
