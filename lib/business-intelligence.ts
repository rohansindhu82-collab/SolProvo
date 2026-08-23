import { getWebsiteBlueprint } from "@/lib/website-blueprints";

export type EvidenceSource = "maps" | "website" | "reviews" | "derived";
export type BusinessReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime?: string;
  source: EvidenceSource;
};
export type BusinessIntelligence = {
  version: 1;
  generatedAt: string;
  blueprintId: string;
  business: { name: string; category: string; address: string; phone?: string; website?: string; mapsUrl?: string };
  maps: { rating?: number; reviewCount?: number; status?: string; hours?: string[]; photos: string[] };
  reviews: BusinessReview[];
  website: { title?: string; description?: string; finalUrl?: string; images: string[]; text?: string; signals: string[] };
  extracted: { services: string[]; products: string[]; menuItems: string[]; offers: string[]; faqCandidates: string[]; serviceAreas: string[] };
  reviewThemes: Record<string, number>;
  evidence: { source: EvidenceSource; field: string; value: string }[];
  gaps: string[];
  confidence: "high" | "medium" | "low";
};

const clean = (v: unknown) => typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
const unique = (items: string[]) => [...new Set(items.map(clean).filter(Boolean))].slice(0, 30);
const snippets = (text: string, patterns: RegExp[]) => unique(patterns.flatMap((pattern) => [...text.matchAll(pattern)].map((m) => m[1] || m[0]).map((v) => v.slice(0, 100))));

export function buildBusinessIntelligence(input: any): BusinessIntelligence {
  const category = clean(input.category) || "local business";
  const blueprint = getWebsiteBlueprint(category);
  const website = input.websiteAudit || {};
  const websiteText = clean(input.websiteText);
  const reviews: BusinessReview[] = Array.isArray(input.reviews) ? input.reviews.map((r: any) => ({
    author: clean(r.authorAttribution?.displayName || r.author || "Google reviewer"),
    rating: Number(r.rating) || 0,
    text: clean(r.text?.text || r.text || ""),
    relativeTime: clean(r.relativePublishTimeDescription || r.relativeTime),
    source: "reviews",
  })).filter((r: BusinessReview) => r.text || r.rating).slice(0, 12) : [];
  const sourceText = [websiteText, ...reviews.map(r => r.text)].join(" ").toLowerCase();
  const signals = blueprint.reviewSignals;
  const reviewThemes: Record<string, number> = {};
  for (const signal of signals) reviewThemes[signal] = reviews.filter(r => r.text.toLowerCase().includes(signal.replaceAll("_", " "))).length;
  const extracted = {
    services: unique([
      ...((input.services || []) as string[]),
      ...snippets(websiteText, [/(?:services?|treatments?|solutions?)\s*[:\-]\s*([^.!?]{8,120})/gi]),
    ]),
    products: unique([
      ...((input.products || []) as string[]),
      ...snippets(websiteText, [/(?:products?|specialit(?:y|ies)|popular items?)\s*[:\-]\s*([^.!?]{8,120})/gi]),
    ]),
    menuItems: unique([...(input.menuItems || []) as string[], ...snippets(websiteText, [/(?:menu|dishes|food)\s*[:\-]\s*([^.!?]{8,120})/gi])]),
    offers: unique([...(input.offers || []) as string[], ...snippets(websiteText, [/(?:offer|discount|deal|special)\s*[:\-]\s*([^.!?]{8,120})/gi])]),
    faqCandidates: unique([...(input.faqCandidates || []) as string[], ...snippets(websiteText, [/(?:how|what|where|when|do you|can i)[^.!?]{8,120}\?/gi])]),
    serviceAreas: unique([...(input.serviceAreas || []) as string[]]),
  };
  const gaps = blueprint.opportunityChecks.filter((key) => {
    if (key.includes("menu")) return !extracted.menuItems.length;
    if (key.includes("product")) return !extracted.products.length;
    if (key.includes("service_catalog")) return !extracted.services.length;
    if (key.includes("gallery") || key.includes("portfolio")) return !(website.images?.length || input.photoNames?.length);
    if (key.includes("reviews")) return !reviews.length;
    if (key.includes("whatsapp")) return !website.signals?.includes("whatsapp");
    if (key.includes("booking") || key.includes("appointment") || key.includes("site_visit")) return !website.signals?.includes("booking");
    if (key.includes("lead_form")) return !website.signals?.includes("leadCapture");
    if (key.includes("hours")) return !(input.hours?.length || websiteText.match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i));
    return false;
  });
  const evidence = [
    ["maps", "name", clean(input.name)], ["maps", "address", clean(input.address)], ["maps", "phone", clean(input.phone)],
    ["maps", "rating", String(input.rating ?? "")], ["maps", "reviewCount", String(input.reviewCount ?? "")],
    ["website", "title", clean(website.title)], ["website", "description", clean(website.description)],
  ].filter(([, , value]) => value).map(([source, field, value]) => ({ source: source as EvidenceSource, field, value }));
  return {
    version: 1, generatedAt: new Date().toISOString(), blueprintId: blueprint.id,
    business: { name: clean(input.name), category, address: clean(input.address), phone: clean(input.phone) || undefined, website: clean(input.website) || undefined, mapsUrl: clean(input.mapsUrl) || undefined },
    maps: { rating: Number(input.rating) || undefined, reviewCount: Number(input.reviewCount) || undefined, status: clean(input.businessStatus) || undefined, hours: Array.isArray(input.hours) ? input.hours.map(clean).filter(Boolean) : [], photos: unique([...(input.photoNames || [])]) },
    reviews, website: { title: clean(website.title) || undefined, description: clean(website.description) || undefined, finalUrl: clean(website.finalUrl) || undefined, images: unique(website.images || []), text: websiteText.slice(0, 12000) || undefined, signals: Array.isArray(website.signals) ? website.signals.map((s: any) => clean(s.key || s)).filter(Boolean) : [] },
    extracted, reviewThemes, evidence, gaps, confidence: reviews.length >= 3 && (website.title || input.name) ? "high" : input.name ? "medium" : "low",
  };
}
