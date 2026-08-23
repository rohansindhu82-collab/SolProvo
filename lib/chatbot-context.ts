import type { WorkspaceProspect } from "@/lib/workspace";
import { getBlueprintById, getWebsiteBlueprint, type WebsiteBlueprint } from "@/lib/website-blueprints";

export type BusinessChatContext = {
  business: Pick<WorkspaceProspect, "id" | "name" | "category" | "location" | "phone" | "website" | "mapsUrl">;
  blueprint: Pick<WebsiteBlueprint, "id" | "name" | "conversionGoal" | "chatbotIntents" | "reviewSignals">;
  verifiedFacts: string[];
  reviews: Array<{ rating: number; text: string; author?: string }>;
  knowledge: { services: string[]; products: string[]; menuItems: string[]; offers: string[]; faqCandidates: string[]; serviceAreas: string[]; hours: string[] };
  allowedTopics: string[];
  unknownPolicy: string;
  leadCapture: { enabled: true; intentRequired: boolean };
};

export function buildBusinessChatContext(prospect: WorkspaceProspect): BusinessChatContext {
  const blueprint = prospect.blueprintId ? getBlueprintById(prospect.blueprintId) : getWebsiteBlueprint(prospect.category);
  const intelligence = prospect.intelligence;
  const verifiedFacts = [
    `Business name: ${prospect.name}`, `Category: ${prospect.category}`, `Location: ${prospect.location}`,
    prospect.phone ? `Phone: ${prospect.phone}` : "", prospect.website ? `Website: ${prospect.website}` : "",
    prospect.mapsUrl ? `Maps listing: ${prospect.mapsUrl}` : "",
    prospect.rating ? `Google rating: ${prospect.rating}${prospect.reviewCount ? ` from ${prospect.reviewCount} reviews` : ""}` : "",
  ].filter(Boolean);
  return {
    business: { id: prospect.id, name: prospect.name, category: prospect.category, location: prospect.location, phone: prospect.phone, website: prospect.website, mapsUrl: prospect.mapsUrl },
    blueprint: { id: blueprint.id, name: blueprint.name, conversionGoal: blueprint.conversionGoal, chatbotIntents: blueprint.chatbotIntents, reviewSignals: blueprint.reviewSignals },
    verifiedFacts,
    reviews: Array.isArray(intelligence?.reviews) ? intelligence.reviews.map((r: any) => ({ rating: Number(r.rating)||0, text: String(r.text||""), author: r.author })) : (prospect.reviews||[]).map(r=>({rating:Number(r.rating)||0,text:String(r.text||""),author:r.author})),
    knowledge: { services:intelligence?.extracted?.services||[], products:intelligence?.extracted?.products||[], menuItems:intelligence?.extracted?.menuItems||[], offers:intelligence?.extracted?.offers||[], faqCandidates:intelligence?.extracted?.faqCandidates||[], serviceAreas:intelligence?.extracted?.serviceAreas||[], hours:prospect.hours||intelligence?.maps?.hours||[] },
    allowedTopics: blueprint.chatbotIntents,
    unknownPolicy: "Only answer from verified business facts or explicitly supplied review/website evidence. If a fact is unavailable, say it is not verified and offer contact or lead capture instead. Never invent prices, services, availability, policies, reviews or business claims.",
    leadCapture: { enabled: true, intentRequired: true },
  };
}
