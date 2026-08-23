export type WebsiteSection =
  | "hero"
  | "about"
  | "services"
  | "menu"
  | "products"
  | "properties"
  | "team"
  | "portfolio"
  | "gallery"
  | "reviews"
  | "offers"
  | "pricing"
  | "booking"
  | "lead-capture"
  | "faq"
  | "location"
  | "hours"
  | "contact"
  | "service-area"
  | "process"
  | "amenities"
  | "testimonials"
  | "cta";

export type ChatIntent =
  | "services"
  | "menu"
  | "products"
  | "pricing"
  | "availability"
  | "booking"
  | "appointment"
  | "property-search"
  | "site-visit"
  | "offers"
  | "reviews"
  | "hours"
  | "location"
  | "directions"
  | "contact"
  | "service-area"
  | "faq"
  | "lead";

export type WebsiteBlueprint = {
  id: string;
  name: string;
  family: string;
  match: RegExp;
  conversionGoal: string;
  primaryCta: string;
  secondaryCta: string;
  visualPriority: "high" | "medium";
  requiredSections: WebsiteSection[];
  optionalSections: WebsiteSection[];
  requiredData: string[];
  opportunityChecks: string[];
  chatbotIntents: ChatIntent[];
  reviewSignals: string[];
};

const common = {
  optionalSections: ["about", "reviews", "gallery", "faq", "location", "hours", "contact", "cta"] as WebsiteSection[],
  requiredData: ["name", "category", "location", "phone", "mapsUrl"],
};

export const WEBSITE_BLUEPRINTS: WebsiteBlueprint[] = [
  {
    ...common,
    id: "restaurant",
    name: "Restaurant / Dining",
    family: "food",
    match: /restaurant|dining|bistro|dhaba|seafood|grill|bar.?be.?que|eatery/i,
    conversionGoal: "orders, reservations and enquiries",
    primaryCta: "View menu",
    secondaryCta: "Call / WhatsApp",
    visualPriority: "high",
    requiredSections: ["hero", "menu", "services", "gallery", "reviews", "location", "cta"],
    optionalSections: ["about", "offers", "pricing", "hours", "booking", "faq", "contact"],
    requiredData: [...common.requiredData, "photos", "hours", "reviews"],
    opportunityChecks: ["menu_missing", "booking_missing", "weak_cta", "weak_gallery", "missing_whatsapp", "missing_location"],
    chatbotIntents: ["menu", "services", "pricing", "offers", "reviews", "hours", "location", "directions", "contact", "lead"],
    reviewSignals: ["popular_dishes", "food_quality", "service", "delivery", "ambience", "family_friendly"],
  },
  {
    ...common,
    id: "cafe",
    name: "Cafe / Coffee Shop",
    family: "food",
    match: /cafe|coffee|coffee.?shop/i,
    conversionGoal: "visits, orders and reservations",
    primaryCta: "Explore menu",
    secondaryCta: "Get directions",
    visualPriority: "high",
    requiredSections: ["hero", "menu", "gallery", "reviews", "hours", "location", "cta"],
    optionalSections: ["about", "offers", "booking", "faq", "contact"],
    requiredData: [...common.requiredData, "photos", "hours", "reviews"],
    opportunityChecks: ["menu_missing", "gallery_missing", "hours_missing", "weak_cta", "missing_location"],
    chatbotIntents: ["menu", "pricing", "offers", "reviews", "hours", "location", "directions", "contact", "lead"],
    reviewSignals: ["coffee", "food", "ambience", "service", "work_friendly", "family_friendly"],
  },
  {
    ...common,
    id: "bakery",
    name: "Bakery / Cake Shop",
    family: "food",
    match: /bakery|cake|pastry|confection|sweet.?shop|dessert/i,
    conversionGoal: "product enquiries and orders",
    primaryCta: "Explore products",
    secondaryCta: "Order on WhatsApp",
    visualPriority: "high",
    requiredSections: ["hero", "products", "gallery", "lead-capture", "reviews", "location", "cta"],
    optionalSections: ["menu", "offers", "pricing", "hours", "faq", "contact"],
    requiredData: [...common.requiredData, "photos", "reviews"],
    opportunityChecks: ["product_catalog_missing", "order_cta_missing", "gallery_missing", "weak_cta"],
    chatbotIntents: ["products", "menu", "pricing", "offers", "reviews", "hours", "location", "contact", "lead"],
    reviewSignals: ["taste", "cakes", "custom_orders", "freshness", "delivery", "service"],
  },
  {
    ...common,
    id: "home-food",
    name: "Home Food / Tiffin / Cloud Kitchen",
    family: "food",
    match: /home.?food|tiffin|cloud.?kitchen|meal.?delivery|meal.?prep|homemade|food.?delivery/i,
    conversionGoal: "orders and WhatsApp enquiries",
    primaryCta: "See today's menu",
    secondaryCta: "Order on WhatsApp",
    visualPriority: "high",
    requiredSections: ["hero", "menu", "services", "lead-capture", "reviews", "service-area", "cta"],
    optionalSections: ["offers", "pricing", "gallery", "hours", "location", "faq", "contact"],
    requiredData: [...common.requiredData, "photos", "hours"],
    opportunityChecks: ["menu_missing", "delivery_area_missing", "order_cta_missing", "pricing_missing"],
    chatbotIntents: ["menu", "pricing", "offers", "service-area", "hours", "reviews", "contact", "lead"],
    reviewSignals: ["taste", "portion", "delivery", "value", "homemade", "packaging"],
  },
  {
    ...common,
    id: "hotel-resort",
    name: "Hotel / Resort",
    family: "hospitality",
    match: /hotel|resort|guest.?house|homestay|villa|lodge/i,
    conversionGoal: "room enquiries and bookings",
    primaryCta: "Check availability",
    secondaryCta: "Call / WhatsApp",
    visualPriority: "high",
    requiredSections: ["hero", "amenities", "gallery", "booking", "reviews", "location", "cta"],
    optionalSections: ["about", "pricing", "offers", "faq", "hours", "contact"],
    requiredData: [...common.requiredData, "photos", "hours", "reviews"],
    opportunityChecks: ["booking_missing", "room_info_missing", "gallery_missing", "weak_cta", "location_missing"],
    chatbotIntents: ["services", "pricing", "availability", "booking", "offers", "reviews", "hours", "location", "directions", "contact", "lead"],
    reviewSignals: ["rooms", "cleanliness", "service", "location", "food", "family_friendly"],
  },
  {
    ...common,
    id: "real-estate-agent",
    name: "Real Estate Agent / Broker",
    family: "real-estate",
    match: /real.?estate|realtor|property.?dealer|estate.?agent|broker|property.?consult/i,
    conversionGoal: "qualified property enquiries and site visits",
    primaryCta: "Find a property",
    secondaryCta: "Request a site visit",
    visualPriority: "high",
    requiredSections: ["hero", "properties", "services", "lead-capture", "reviews", "location", "cta"],
    optionalSections: ["about", "gallery", "pricing", "team", "faq", "contact"],
    requiredData: [...common.requiredData, "location", "reviews"],
    opportunityChecks: ["property_catalog_missing", "site_visit_missing", "lead_form_missing", "weak_cta", "whatsapp_missing"],
    chatbotIntents: ["property-search", "pricing", "availability", "site-visit", "reviews", "location", "directions", "contact", "lead", "faq"],
    reviewSignals: ["responsiveness", "trust", "property_quality", "closing", "local_knowledge"],
  },
  {
    ...common,
    id: "builder-developer",
    name: "Builder / Property Developer",
    family: "real-estate",
    match: /builder|developer|realty|infrastructure|housing.?project/i,
    conversionGoal: "project enquiries and site visits",
    primaryCta: "Explore projects",
    secondaryCta: "Book a site visit",
    visualPriority: "high",
    requiredSections: ["hero", "properties", "amenities", "gallery", "lead-capture", "location", "cta"],
    optionalSections: ["about", "pricing", "reviews", "faq", "contact"],
    requiredData: [...common.requiredData, "photos", "location"],
    opportunityChecks: ["project_details_missing", "floorplan_missing", "site_visit_missing", "lead_form_missing"],
    chatbotIntents: ["property-search", "pricing", "availability", "site-visit", "location", "directions", "contact", "lead", "faq"],
    reviewSignals: ["construction", "location", "amenities", "service", "delivery"],
  },
  {
    ...common,
    id: "dental",
    name: "Dentist / Dental Clinic",
    family: "healthcare",
    match: /dental|dentist|orthodont|implant|endodont/i,
    conversionGoal: "appointments and treatment enquiries",
    primaryCta: "Book an appointment",
    secondaryCta: "WhatsApp the clinic",
    visualPriority: "high",
    requiredSections: ["hero", "services", "team", "reviews", "booking", "location", "faq", "cta"],
    optionalSections: ["about", "gallery", "pricing", "hours", "contact"],
    requiredData: [...common.requiredData, "hours", "reviews", "photos"],
    opportunityChecks: ["appointment_missing", "treatment_info_missing", "doctor_profile_missing", "reviews_missing", "weak_cta"],
    chatbotIntents: ["services", "pricing", "appointment", "booking", "reviews", "hours", "location", "directions", "contact", "faq", "lead"],
    reviewSignals: ["doctor", "pain_free", "cleanliness", "wait_time", "staff", "treatment"],
  },
  {
    ...common,
    id: "clinic",
    name: "Doctor / Clinic",
    family: "healthcare",
    match: /clinic|doctor|physician|medical|hospital|health.?care/i,
    conversionGoal: "appointments and patient enquiries",
    primaryCta: "Book appointment",
    secondaryCta: "Call clinic",
    visualPriority: "medium",
    requiredSections: ["hero", "services", "team", "reviews", "booking", "location", "cta"],
    optionalSections: ["about", "gallery", "hours", "faq", "contact"],
    requiredData: [...common.requiredData, "hours", "reviews"],
    opportunityChecks: ["appointment_missing", "doctor_profile_missing", "hours_missing", "weak_cta"],
    chatbotIntents: ["services", "appointment", "booking", "reviews", "hours", "location", "directions", "contact", "faq", "lead"],
    reviewSignals: ["doctor", "staff", "wait_time", "cleanliness", "care", "outcome"],
  },
  {
    ...common,
    id: "hair-salon",
    name: "Hair Salon",
    family: "beauty",
    match: /hair.?salon|hair.?studio|hair.?dresser|unisex.?salon|hair/i,
    conversionGoal: "appointments and WhatsApp enquiries",
    primaryCta: "Book an appointment",
    secondaryCta: "WhatsApp the salon",
    visualPriority: "high",
    requiredSections: ["hero", "services", "portfolio", "gallery", "reviews", "booking", "location", "cta"],
    optionalSections: ["team", "pricing", "offers", "faq", "hours", "contact"],
    requiredData: [...common.requiredData, "photos", "hours", "reviews"],
    opportunityChecks: ["service_catalog_missing", "booking_missing", "portfolio_missing", "gallery_missing", "whatsapp_missing", "weak_cta"],
    chatbotIntents: ["services", "pricing", "availability", "appointment", "booking", "offers", "reviews", "hours", "location", "directions", "contact", "faq", "lead"],
    reviewSignals: ["haircut", "styling", "colour", "staff", "cleanliness", "value", "appointment"],
  },
  {
    ...common,
    id: "beauty-spa",
    name: "Beauty Salon / Spa",
    family: "beauty",
    match: /beauty|spa|parlour|parlor|nail|makeup|skincare/i,
    conversionGoal: "appointments and treatment enquiries",
    primaryCta: "Book a treatment",
    secondaryCta: "WhatsApp us",
    visualPriority: "high",
    requiredSections: ["hero", "services", "gallery", "reviews", "booking", "location", "cta"],
    optionalSections: ["team", "pricing", "offers", "portfolio", "faq", "hours", "contact"],
    requiredData: [...common.requiredData, "photos", "hours", "reviews"],
    opportunityChecks: ["service_catalog_missing", "booking_missing", "gallery_missing", "pricing_missing", "weak_cta"],
    chatbotIntents: ["services", "pricing", "availability", "appointment", "booking", "offers", "reviews", "hours", "location", "contact", "lead"],
    reviewSignals: ["service", "staff", "ambience", "cleanliness", "value", "treatment"],
  },
  {
    ...common,
    id: "barber",
    name: "Barber / Grooming",
    family: "beauty",
    match: /barber|grooming|mens.?salon|men.?salon/i,
    conversionGoal: "appointments and walk-ins",
    primaryCta: "Book a haircut",
    secondaryCta: "Get directions",
    visualPriority: "high",
    requiredSections: ["hero", "services", "portfolio", "gallery", "reviews", "booking", "location", "cta"],
    optionalSections: ["pricing", "offers", "team", "hours", "contact"],
    requiredData: [...common.requiredData, "photos", "reviews"],
    opportunityChecks: ["service_catalog_missing", "booking_missing", "portfolio_missing", "hours_missing"],
    chatbotIntents: ["services", "pricing", "availability", "appointment", "booking", "reviews", "hours", "location", "directions", "contact", "lead"],
    reviewSignals: ["haircut", "beard", "staff", "style", "value", "wait_time"],
  },
  {
    ...common,
    id: "home-service",
    name: "Home / Repair Service",
    family: "services",
    match: /plumb|electric|repair|cleaning|pest|ac.?repair|appliance|carpenter|contractor|home.?service|maintenance/i,
    conversionGoal: "service requests and calls",
    primaryCta: "Request a service",
    secondaryCta: "Call now",
    visualPriority: "medium",
    requiredSections: ["hero", "services", "service-area", "reviews", "lead-capture", "contact", "cta"],
    optionalSections: ["about", "gallery", "pricing", "offers", "faq", "location", "hours"],
    requiredData: [...common.requiredData, "serviceArea", "reviews"],
    opportunityChecks: ["service_catalog_missing", "service_area_missing", "lead_form_missing", "phone_missing", "weak_cta"],
    chatbotIntents: ["services", "pricing", "availability", "service-area", "reviews", "hours", "location", "contact", "faq", "lead"],
    reviewSignals: ["response_time", "quality", "pricing", "technician", "cleanliness", "reliability"],
  },
  {
    ...common,
    id: "automotive",
    name: "Auto Workshop / Service",
    family: "automotive",
    match: /car.?service|auto|automobile|garage|workshop|mechanic|car.?repair|detailing|car.?wash/i,
    conversionGoal: "service bookings and enquiries",
    primaryCta: "Book a service",
    secondaryCta: "Call workshop",
    visualPriority: "high",
    requiredSections: ["hero", "services", "gallery", "reviews", "booking", "location", "cta"],
    optionalSections: ["pricing", "offers", "team", "faq", "hours", "contact"],
    requiredData: [...common.requiredData, "photos", "reviews", "hours"],
    opportunityChecks: ["service_catalog_missing", "booking_missing", "gallery_missing", "weak_cta"],
    chatbotIntents: ["services", "pricing", "availability", "booking", "reviews", "hours", "location", "directions", "contact", "lead"],
    reviewSignals: ["repair_quality", "pricing", "speed", "staff", "transparency", "cleanliness"],
  },
  {
    ...common,
    id: "retail",
    name: "Retail Store",
    family: "retail",
    match: /retail|store|shop|showroom|market|boutique/i,
    conversionGoal: "product enquiries and store visits",
    primaryCta: "Explore products",
    secondaryCta: "Visit store",
    visualPriority: "high",
    requiredSections: ["hero", "products", "gallery", "reviews", "location", "contact", "cta"],
    optionalSections: ["services", "offers", "pricing", "hours", "faq", "lead-capture"],
    requiredData: [...common.requiredData, "photos", "reviews", "hours"],
    opportunityChecks: ["product_catalog_missing", "gallery_missing", "location_missing", "weak_cta", "whatsapp_missing"],
    chatbotIntents: ["products", "pricing", "offers", "reviews", "hours", "location", "directions", "contact", "lead"],
    reviewSignals: ["product_quality", "selection", "staff", "pricing", "service", "availability"],
  },
  {
    ...common,
    id: "electronics",
    name: "Electronics Store",
    family: "retail",
    match: /electronics|mobile|computer|laptop|appliance|tv|refrigerator|washing.?machine/i,
    conversionGoal: "product enquiries and store visits",
    primaryCta: "Explore products",
    secondaryCta: "WhatsApp for price",
    visualPriority: "high",
    requiredSections: ["hero", "products", "services", "gallery", "reviews", "location", "cta"],
    optionalSections: ["offers", "pricing", "hours", "faq", "lead-capture", "contact"],
    requiredData: [...common.requiredData, "photos", "reviews", "hours"],
    opportunityChecks: ["product_catalog_missing", "offer_visibility_missing", "whatsapp_missing", "gallery_missing"],
    chatbotIntents: ["products", "pricing", "offers", "reviews", "hours", "location", "directions", "contact", "lead"],
    reviewSignals: ["product_selection", "pricing", "staff", "after_sales", "delivery", "installation"],
  },
  {
    ...common,
    id: "professional-services",
    name: "Professional Service",
    family: "professional",
    match: /lawyer|advocate|ca |accountant|chartered|consultant|consulting|agency|architect|designer|insurance/i,
    conversionGoal: "qualified consultation enquiries",
    primaryCta: "Request a consultation",
    secondaryCta: "Call / WhatsApp",
    visualPriority: "medium",
    requiredSections: ["hero", "services", "about", "reviews", "lead-capture", "location", "cta"],
    optionalSections: ["team", "portfolio", "process", "faq", "hours", "contact"],
    requiredData: [...common.requiredData, "reviews"],
    opportunityChecks: ["service_catalog_missing", "consultation_cta_missing", "team_missing", "lead_form_missing"],
    chatbotIntents: ["services", "pricing", "availability", "reviews", "hours", "location", "contact", "faq", "lead"],
    reviewSignals: ["trust", "responsiveness", "expertise", "communication", "outcome"],
  },
  {
    ...common,
    id: "education",
    name: "School / Coaching / Training",
    family: "education",
    match: /school|college|coaching|institute|academy|training|tuition|education|classes/i,
    conversionGoal: "admission enquiries and visits",
    primaryCta: "Explore programs",
    secondaryCta: "Enquire now",
    visualPriority: "high",
    requiredSections: ["hero", "services", "team", "gallery", "reviews", "lead-capture", "location", "cta"],
    optionalSections: ["about", "process", "pricing", "faq", "hours", "contact"],
    requiredData: [...common.requiredData, "photos", "reviews"],
    opportunityChecks: ["course_catalog_missing", "admission_cta_missing", "faculty_missing", "gallery_missing"],
    chatbotIntents: ["services", "pricing", "availability", "reviews", "hours", "location", "directions", "contact", "faq", "lead"],
    reviewSignals: ["teachers", "results", "support", "environment", "value", "placements"],
  },
  {
    ...common,
    id: "wedding-events",
    name: "Wedding / Event Venue",
    family: "events",
    match: /wedding|banquet|event.?venue|marriage|party.?hall|event.?planner/i,
    conversionGoal: "venue enquiries and bookings",
    primaryCta: "Check availability",
    secondaryCta: "Request a quote",
    visualPriority: "high",
    requiredSections: ["hero", "gallery", "amenities", "lead-capture", "reviews", "location", "cta"],
    optionalSections: ["services", "pricing", "offers", "faq", "hours", "contact"],
    requiredData: [...common.requiredData, "photos", "reviews"],
    opportunityChecks: ["gallery_missing", "booking_missing", "package_missing", "lead_form_missing"],
    chatbotIntents: ["services", "pricing", "availability", "booking", "reviews", "hours", "location", "directions", "contact", "lead", "faq"],
    reviewSignals: ["venue", "food", "staff", "ambience", "decor", "value"],
  },
  {
    ...common,
    id: "photographer",
    name: "Photographer / Creative",
    family: "creative",
    match: /photograph|photo.?studio|videograph|creative.?studio/i,
    conversionGoal: "portfolio enquiries and bookings",
    primaryCta: "View portfolio",
    secondaryCta: "Check availability",
    visualPriority: "high",
    requiredSections: ["hero", "portfolio", "gallery", "services", "reviews", "lead-capture", "cta"],
    optionalSections: ["about", "pricing", "team", "location", "faq", "contact"],
    requiredData: [...common.requiredData, "photos", "reviews"],
    opportunityChecks: ["portfolio_missing", "gallery_missing", "booking_missing", "lead_form_missing"],
    chatbotIntents: ["services", "pricing", "availability", "booking", "reviews", "location", "contact", "faq", "lead"],
    reviewSignals: ["quality", "creativity", "communication", "delivery", "value"],
  },
  {
    ...common,
    id: "travel",
    name: "Travel Agency / Tours",
    family: "travel",
    match: /travel|tour|holiday|vacation|trip|tourism/i,
    conversionGoal: "trip enquiries and bookings",
    primaryCta: "Explore packages",
    secondaryCta: "Plan a trip",
    visualPriority: "high",
    requiredSections: ["hero", "services", "gallery", "reviews", "lead-capture", "contact", "cta"],
    optionalSections: ["pricing", "offers", "location", "faq", "hours"],
    requiredData: [...common.requiredData, "photos", "reviews"],
    opportunityChecks: ["package_catalog_missing", "booking_missing", "gallery_missing", "lead_form_missing"],
    chatbotIntents: ["services", "pricing", "availability", "booking", "offers", "reviews", "location", "contact", "faq", "lead"],
    reviewSignals: ["itinerary", "service", "value", "guides", "support", "hotel"],
  },
  {
    ...common,
    id: "fallback-local",
    name: "Local Business",
    family: "local",
    match: /.*/i,
    conversionGoal: "qualified local enquiries",
    primaryCta: "Contact the business",
    secondaryCta: "Get directions",
    visualPriority: "medium",
    requiredSections: ["hero", "services", "reviews", "lead-capture", "location", "contact", "cta"],
    optionalSections: ["about", "gallery", "pricing", "offers", "faq", "hours"],
    requiredData: [...common.requiredData],
    opportunityChecks: ["weak_cta", "lead_form_missing", "gallery_missing", "location_missing", "contact_missing"],
    chatbotIntents: ["services", "pricing", "reviews", "hours", "location", "directions", "contact", "faq", "lead"],
    reviewSignals: ["service", "quality", "staff", "value", "location", "reliability"],
  },
];

export function getWebsiteBlueprint(categoryOrTypes: string): WebsiteBlueprint {
  const value = categoryOrTypes || "";
  return WEBSITE_BLUEPRINTS.find((blueprint) => blueprint.match.test(value)) || WEBSITE_BLUEPRINTS[WEBSITE_BLUEPRINTS.length - 1];
}

export function getBlueprintById(id?: string | null): WebsiteBlueprint {
  return WEBSITE_BLUEPRINTS.find((blueprint) => blueprint.id === id) || WEBSITE_BLUEPRINTS[WEBSITE_BLUEPRINTS.length - 1];
}

export function listBlueprintSummaries() {
  return WEBSITE_BLUEPRINTS.map(({ id, name, family, conversionGoal, primaryCta }) => ({ id, name, family, conversionGoal, primaryCta }));
}
