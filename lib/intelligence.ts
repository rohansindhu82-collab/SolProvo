import type { WorkspaceProspect } from "@/lib/workspace";

export type ProspectIntelligence = {
  opportunityLabel: "High" | "Medium" | "Low";
  reason: string;
  recommendedService: string;
  recommendedPackage: "Starter" | "Growth" | "Premium";
  demoType: "lead-capture" | "appointment" | "offers" | "reactivation";
  nextBestAction: string;
};

const vertical = (category: string) => category.toLowerCase().includes("dental") || category.toLowerCase().includes("dentist") ? "dental" : category.toLowerCase().includes("real") || category.toLowerCase().includes("property") ? "real-estate" : "local";

export function buildProspectIntelligence(prospect: Pick<WorkspaceProspect, "category" | "score" | "gaps">): ProspectIntelligence {
  const kind = vertical(prospect.category);
  const high = prospect.score >= 70 || prospect.gaps >= 3;
  const medium = prospect.score >= 33 || prospect.gaps >= 1;
  if (kind === "dental") {
    if (high) return { opportunityLabel:"High", reason:"Multiple customer-journey gaps were verified on the public page.", recommendedService:"Appointment + WhatsApp enquiry flow", recommendedPackage:"Growth", demoType:"appointment", nextBestAction:"Prepare a dental appointment demo" };
    if (medium) return { opportunityLabel:"Medium", reason:"At least one customer-journey gap was verified on the public page.", recommendedService:"Lead capture + follow-up", recommendedPackage:"Starter", demoType:"lead-capture", nextBestAction:"Review the verified evidence" };
    return { opportunityLabel:"Low", reason:"No customer-journey gap was verified on the analyzed page.", recommendedService:"Digital presence review", recommendedPackage:"Starter", demoType:"lead-capture", nextBestAction:"Check other public customer touchpoints before contacting" };
  }
  if (kind === "real-estate") {
    if (high) return { opportunityLabel:"High", reason:"Multiple customer-journey gaps were verified on the public page.", recommendedService:"Property enquiry + site-visit funnel", recommendedPackage:"Growth", demoType:"appointment", nextBestAction:"Prepare a property enquiry demo" };
    if (medium) return { opportunityLabel:"Medium", reason:"At least one customer-journey gap was verified on the public page.", recommendedService:"Lead capture + WhatsApp follow-up", recommendedPackage:"Starter", demoType:"lead-capture", nextBestAction:"Review the verified evidence" };
    return { opportunityLabel:"Low", reason:"No customer-journey gap was verified on the analyzed page.", recommendedService:"Digital presence review", recommendedPackage:"Starter", demoType:"lead-capture", nextBestAction:"Check other public customer touchpoints before contacting" };
  }
  if (high) return { opportunityLabel:"High", reason:"Multiple customer-journey gaps were verified on the public page.", recommendedService:"Lead capture + automated follow-up", recommendedPackage:"Growth", demoType:"lead-capture", nextBestAction:"Prepare a personalized lead demo" };
  if (medium) return { opportunityLabel:"Medium", reason:"At least one customer-journey gap was verified on the public page.", recommendedService:"Lead capture + follow-up", recommendedPackage:"Starter", demoType:"lead-capture", nextBestAction:"Review the verified evidence" };
  return { opportunityLabel:"Low", reason:"No customer-journey gap was verified on the analyzed page.", recommendedService:"Digital presence review", recommendedPackage:"Starter", demoType:"lead-capture", nextBestAction:"Check other public customer touchpoints before contacting" };
}
