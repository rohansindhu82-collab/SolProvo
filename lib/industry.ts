export type Industry = "real-estate" | "dental";

export type IndustryRule = {
  name: string;
  keywords: string[];
  demoFeatures: string[];
  pitch: string;
};

export const INDUSTRIES: Record<Industry, IndustryRule> = {
  "real-estate": {
    name: "Real Estate",
    keywords: ["property", "properties", "real estate", "broker", "dealer", "builder", "residential", "commercial", "plot", "flat", "apartment"],
    demoFeatures: ["Property enquiry", "Budget and locality qualification", "Site-visit request", "Lead follow-up", "Offer / project campaign"],
    pitch: "Turn property enquiries into qualified conversations and site visits.",
  },
  dental: {
    name: "Dental Clinic",
    keywords: ["dentist", "dental", "clinic", "implant", "orthodont", "braces", "root canal"],
    demoFeatures: ["Treatment enquiry", "Appointment request", "Callback request", "Follow-up", "Review request"],
    pitch: "Turn patient enquiries into organised appointment requests and follow-ups.",
  },
};

export function detectIndustry(input: string): { industry: Industry; confidence: "high" | "medium" | "low" } {
  const value = input.toLowerCase();
  const scores = (Object.entries(INDUSTRIES) as [Industry, IndustryRule][]).map(([industry, rule]) => ({ industry, hits: rule.keywords.filter((keyword) => value.includes(keyword)).length }));
  scores.sort((a, b) => b.hits - a.hits);
  const best = scores[0];
  if (!best || best.hits === 0) return { industry: "real-estate", confidence: "low" };
  return { industry: best.industry, confidence: best.hits >= 2 ? "high" : "medium" };
}
