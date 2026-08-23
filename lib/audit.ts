export type AuditSignal = {
  key: "website" | "whatsapp" | "phone" | "leadCapture" | "booking" | "offers" | "social";
  label: string;
  detected: boolean;
  confidence: "high" | "medium" | "low";
  evidence: string[];
};

export type WebsiteAudit = {
  url: string;
  finalUrl: string;
  title: string;
  description: string;
  scannedAt: string;
  score: number;
  signals: AuditSignal[];
  opportunities: { key: string; title: string; reason: string }[];
  limitations: string[];
};

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function matches(html: string, pattern: RegExp) {
  return pattern.test(html);
}

function evidence(html: string, pattern: RegExp, fallback: string) {
  const text = stripHtml(html);
  const match = text.match(pattern);
  return match?.[0] ? [match[0].slice(0, 120)] : [fallback];
}

const SOCIAL_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "facebook.com",
  "www.facebook.com",
  "linkedin.com",
  "www.linkedin.com",
  "youtube.com",
  "www.youtube.com",
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
]);

export function validatePublicUrl(input: string) {
  const value = input.trim().startsWith("http") ? input.trim() : `https://${input.trim()}`;
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only public HTTP(S) websites can be analyzed.");

  const host = url.hostname.toLowerCase();
  if (SOCIAL_HOSTS.has(host) || host.endsWith(".instagram.com") || host.endsWith(".facebook.com") || host.endsWith(".linkedin.com") || host.endsWith(".youtube.com")) {
    throw new Error("Social media profiles are discovery references, not business websites, so they are not scored as website audits.");
  }

  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host.endsWith(".local")) {
    throw new Error("Private/local addresses cannot be analyzed.");
  }
  if (/^(10\.|127\.|169\.254\.|192\.168\.)/.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    throw new Error("Private network addresses cannot be analyzed.");
  }
  return url;
}

export async function auditWebsite(input: string): Promise<WebsiteAudit> {
  const url = validatePublicUrl(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "SolProvo-Website-Audit/0.1 (+https://solprovo.in)" },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Website returned HTTP ${response.status}.`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) throw new Error("The supplied URL did not return an HTML page.");

    const html = (await response.text()).slice(0, 2_000_000);
    const finalUrl = response.url || url.toString();
    const finalHost = new URL(finalUrl).hostname.toLowerCase();
    if (SOCIAL_HOSTS.has(finalHost) || finalHost.endsWith(".instagram.com") || finalHost.endsWith(".facebook.com") || finalHost.endsWith(".linkedin.com") || finalHost.endsWith(".youtube.com")) {
      throw new Error("The URL redirected to a social media profile, not a business website.");
    }

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "Untitled website";
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim() || "";

    const whatsapp = matches(html, /wa\.me\//i) || matches(html, /api\.whatsapp\.com/i) || matches(html, /whatsapp/i);
    const phone = matches(html, /href=["']tel:/i) || matches(html, /(?:call|phone|mobile|contact)[^<]{0,60}\+?\d[\d\s().-]{7,}/i);
    const leadCapture = matches(html, /<form\b/i) || matches(html, /(enquir|inquir|request.*callback|get.*quote|contact.*us)/i);
    const booking = matches(html, /(book.*appointment|schedule.*appointment|book.*visit|schedule.*visit|book.*consult|appointment)/i) || matches(html, /(calendly|acuity|zohobookings|setmore|simplybook)/i);
    const offers = matches(html, /(offer|discount|coupon|deal|special.*price|limited.*time|save\s+\d+%)/i);
    const social = matches(html, /(instagram\.com|facebook\.com|linkedin\.com|youtube\.com)/i);

    const signals: AuditSignal[] = [
      { key: "website", label: "Website", detected: true, confidence: "high", evidence: ["Public HTML page responded successfully."] },
      { key: "phone", label: "Phone / call path", detected: phone, confidence: phone ? "high" : "low", evidence: phone ? evidence(html, /(tel:[^"']+|(?:call|phone|mobile)[^<]{0,60})/i, "Phone signal detected") : ["No clear phone link/pattern detected on this page."] },
      { key: "whatsapp", label: "WhatsApp", detected: whatsapp, confidence: whatsapp ? "high" : "low", evidence: whatsapp ? ["WhatsApp link or reference detected on the page."] : ["No WhatsApp link/reference detected on this page."] },
      { key: "leadCapture", label: "Lead capture", detected: leadCapture, confidence: leadCapture ? "medium" : "low", evidence: leadCapture ? ["Form or enquiry/callback language detected."] : ["No clear enquiry/callback form or CTA detected on this page."] },
      { key: "booking", label: "Booking", detected: booking, confidence: booking ? "medium" : "low", evidence: booking ? ["Appointment/visit booking language or booking platform detected."] : ["No clear appointment/site-visit booking signal detected on this page."] },
      { key: "offers", label: "Offers", detected: offers, confidence: offers ? "medium" : "low", evidence: offers ? ["Offer/discount/deal language detected."] : ["No clear offer/deal language detected on this page."] },
      { key: "social", label: "Social links", detected: social, confidence: social ? "high" : "low", evidence: social ? ["At least one major social link detected."] : ["No major social link detected on this page."] },
    ];

    const opportunitySignals = signals.filter((s) => ["leadCapture", "booking", "offers"].includes(s.key));
    const missing = opportunitySignals.filter((s) => !s.detected);
    const opportunities = missing.map((s) => ({
      key: s.key,
      title: s.key === "leadCapture" ? "Strengthen enquiry capture" : s.key === "booking" ? "Add a booking journey" : "Create a customer offer layer",
      reason: s.evidence[0],
    }));

    // Opportunity score is intentionally different from a website-quality score:
    // more verified missing customer-journey capabilities = more sales opportunity.
    const score = Math.round((missing.length / opportunitySignals.length) * 100);

    return {
      url: url.toString(),
      finalUrl,
      title,
      description,
      scannedAt: new Date().toISOString(),
      score,
      signals,
      opportunities,
      limitations: [
        "This audit scans the supplied public page only; it does not prove that a capability does not exist elsewhere on the business's website or offline.",
        "Signals are evidence-based detections, not claims about business performance.",
        "Opportunity score measures only the verified absence of lead capture, booking and offer signals on the analyzed page.",
        "Before outreach, verify the business details and proposed gaps manually.",
      ],
    };
  } finally {
    clearTimeout(timeout);
  }
}
