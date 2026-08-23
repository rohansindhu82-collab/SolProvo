import { NextResponse } from "next/server";
import { auditWebsite } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body?.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ error: "A website URL is required." }, { status: 400 });
    }
    const audit = await auditWebsite(body.url);
    // Keep the direct audit shape for /analyze while also exposing the nested
    // shape expected by the batch discovery client.
    return NextResponse.json({ ...audit, audit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze this website.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
