import type { WorkspaceProspect } from "@/lib/workspace";
import { getBlueprintById, getWebsiteBlueprint, type WebsiteBlueprint } from "@/lib/website-blueprints";

export type BusinessChatContext = {
  business: Pick<WorkspaceProspect, "id" | "name" | "category" | "location" | "phone" | "website" | "mapsUrl">;
  blueprint: Pick<WebsiteBlueprint, "id" | "name" | "conversionGoal" | "chatbotIntents" | "reviewSignals">;
  verifiedFacts: string[];
  allowedTopics: string[];
  unknownPolicy: string;
  leadCapture: { enabled: true; intentRequired: boolean };
};

export function buildBusinessChatContext(prospect: WorkspaceProspect): BusinessChatContext {
  const blueprint = prospect.blueprintId ? getBlueprintById(prospect.blueprintId) : getWebsiteBlueprint(prospect.category);
  const verifiedFacts = [
    `Business name: ${prospect.name}`,
    `Category: ${prospect.category}`,
    `Location: ${prospect.location}`,
    prospect.phone ? `Phone: ${prospect.phone}` : "",
    prospect.website ? `Website: ${prospect.website}` : "",
    prospect.mapsUrl ? `Maps listing: ${prospect.mapsUrl}` : "",
  ].filter(Boolean);

  return {
    business: {
      id: prospect.id,
      name: prospect.name,
      category: prospect.category,
      location: prospect.location,
      phone: prospect.phone,
      website: prospect.website,
      mapsUrl: prospect.mapsUrl,
    },
    blueprint: {
      id: blueprint.id,
      name: blueprint.name,
      conversionGoal: blueprint.conversionGoal,
      chatbotIntents: blueprint.chatbotIntents,
      reviewSignals: blueprint.reviewSignals,
    },
    verifiedFacts,
    allowedTopics: blueprint.chatbotIntents,
    unknownPolicy: "Only answer from verified business facts or explicitly supplied review/website evidence. If a fact is unavailable, say it is not verified and offer contact or lead capture instead. Never invent prices, services, availability, policies, reviews or business claims.",
    leadCapture: { enabled: true, intentRequired: true },
  };
}
