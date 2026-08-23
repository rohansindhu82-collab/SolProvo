import type { WebsiteAudit } from "./audit";
import { detectIndustry, INDUSTRIES, type Industry } from "./industry";

export type Opportunity = { key: string; priority: "high" | "medium"; title: string; reason: string; recommendedService: string };

export function buildOpportunityReport(audit: WebsiteAudit, context = ""): { industry: Industry; confidence: "high" | "medium" | "low"; pitch: string; opportunities: Opportunity[]; recommendedPackage: string } {
  const detected = detectIndustry(`${audit.title} ${audit.description} ${context}`);
  const rule = INDUSTRIES[detected.industry];
  const opportunities = audit.opportunities.map((item, index) => ({
    key: item.key,
    priority: index < 2 ? "high" as const : "medium" as const,
    title: item.title,
    reason: item.reason,
    recommendedService: item.key === "booking" ? rule.demoFeatures[detected.industry === "real-estate" ? 2 : 1] : item.key === "leadCapture" ? rule.demoFeatures[0] : rule.demoFeatures[rule.demoFeatures.length - 1],
  }));
  const recommendedPackage = opportunities.length >= 3 ? "SolProvo Growth" : opportunities.length > 0 ? "SolProvo Starter" : "SolProvo Automation Review";
  return { industry: detected.industry, confidence: detected.confidence, pitch: rule.pitch, opportunities, recommendedPackage };
}
