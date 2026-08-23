import { NextResponse } from "next/server";
import { auditWebsite } from "@/lib/audit";
import { buildOpportunityReport } from "@/lib/opportunity";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body?.url !== "string" || !body.url.trim()) return NextResponse.json({ error: "A website URL is required." }, { status: 400 });
    const audit = await auditWebsite(body.url);
    return NextResponse.json({ audit, report: buildOpportunityReport(audit, typeof body?.businessName === "string" ? body.businessName : "") });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to build opportunity report.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
