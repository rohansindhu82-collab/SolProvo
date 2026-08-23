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

export function buildProspectIntelligence(prospect: Pick<WorkspaceProspect, "category" | "score" | "gaps"> & { websitePresent?: boolean }): ProspectIntelligence {
  const kind = vertical(prospect.category);
  const noWebsite = prospect.websitePresent === false;
  const high = prospect.score >= 70 || prospect.gaps >= 3;
  const medium = prospect.score >= 33 || prospect.gaps >= 1;

  if (noWebsite) {
    if (kind === "dental") return { opportunityLabel:"High", reason:"No website was returned for this business in Maps. The saved Maps context can be used to propose a new appointment-focused website.", recommendedService:"New website + appointment enquiry flow", recommendedPackage:"Growth", demoType:"appointment", nextBestAction:"Prepare a new website demo" };
    if (kind === "real-estate") return { opportunityLabel:"High", reason:"No website was returned for this business in Maps. The saved Maps context can be used to propose a new property-enquiry website.", recommendedService:"New website + property enquiry flow", recommendedPackage:"Growth", demoType:"lead-capture", nextBestAction:"Prepare a new website demo" };
    return { opportunityLabel:"High", reason:"No website was returned for this business in Maps. The saved business name, category, location and contact context can support a new digital presence proposal.", recommendedService:"New website + lead capture", recommendedPackage:"Growth", demoType:"lead-capture", nextBestAction:"Prepare a new website demo" };
  }

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
