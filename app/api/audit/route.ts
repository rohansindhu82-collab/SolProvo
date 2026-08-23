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
    return NextResponse.json(audit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze this website.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
