import type { WorkspaceProspect } from "@/lib/workspace";
import { getWebsiteBlueprint } from "@/lib/website-blueprints";

export type ProspectIntelligence = {
  opportunityLabel: "High" | "Medium" | "Low";
  reason: string;
  recommendedService: string;
  recommendedPackage: "Starter" | "Growth" | "Premium";
  demoType: "lead-capture" | "appointment" | "offers" | "reactivation";
  nextBestAction: string;
  blueprintId: string;
  conversionGoal: string;
  primaryCta: string;
  secondaryCta: string;
  chatbotIntents: string[];
};

export function buildProspectIntelligence(prospect: Pick<WorkspaceProspect, "category" | "score" | "gaps"> & { websitePresent?: boolean }): ProspectIntelligence {
  const blueprint = getWebsiteBlueprint(prospect.category);
  const noWebsite = prospect.websitePresent === false;
  const high = prospect.score >= 70 || prospect.gaps >= 3;
  const medium = prospect.score >= 33 || prospect.gaps >= 1;
  const reason = noWebsite
    ? `No website was returned for this business in Maps. The ${blueprint.name} blueprint can turn the verified local-business context into a new digital presence.`
    : high
      ? `Multiple customer-journey gaps were verified on the public page. The ${blueprint.name} blueprint targets ${blueprint.conversionGoal}.`
      : medium
        ? `At least one customer-journey gap was verified on the public page. The ${blueprint.name} blueprint targets ${blueprint.conversionGoal}.`
        : `No customer-journey gap was verified on the analyzed page. Other public customer touchpoints should be checked before outreach.`;
  const recommendedService = noWebsite
    ? `New ${blueprint.name} website + ${blueprint.conversionGoal}`
    : high
      ? `${blueprint.name} redesign + ${blueprint.conversionGoal}`
      : medium
        ? `${blueprint.name} conversion upgrade + lead capture`
        : "Digital presence review";
  const recommendedPackage = noWebsite || high ? "Growth" : "Starter";
  const demoType = /appointment|booking|availability|site visit/i.test(blueprint.conversionGoal) ? "appointment" : /orders|product enquiries|enquiries/i.test(blueprint.conversionGoal) ? "offers" : "lead-capture";
  return {
    opportunityLabel: noWebsite || high ? "High" : medium ? "Medium" : "Low",
    reason,
    recommendedService,
    recommendedPackage,
    demoType,
    nextBestAction: noWebsite ? `Prepare a ${blueprint.name} website demo` : high ? `Prepare a personalized ${blueprint.name} demo` : medium ? "Review the verified evidence" : "Check other public customer touchpoints before contacting",
    blueprintId: blueprint.id,
    conversionGoal: blueprint.conversionGoal,
    primaryCta: blueprint.primaryCta,
    secondaryCta: blueprint.secondaryCta,
    chatbotIntents: blueprint.chatbotIntents,
  };
}
