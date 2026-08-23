import { cloudList, cloudPut } from "@/lib/cloud";

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Follow-up" | "Converted" | "Lost";
export type AppointmentStatus = "Requested" | "Confirmed" | "Rescheduled" | "Completed" | "Cancelled";

export type BusinessLead = {
  id: string;
  name: string;
  intent: string;
  channel: "Demo" | "Website" | "WhatsApp" | "Google" | "Manual";
  status: LeadStatus;
  prospectId?: string;
  businessName?: string;
  location?: string;
  budget?: string;
  createdAt: string;
  updatedAt: string;
  appointmentId?: string;
};

export type BusinessAppointment = {
  id: string;
  leadId: string;
  customerName: string;
  type: "Site visit" | "Appointment" | "Call";
  scheduledAt: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const LEADS_KEY = "solprovo.businessos.leads.v1";
const APPOINTMENTS_KEY = "solprovo.businessos.appointments.v1";
const EVENT = "solprovo:businessos-changed";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function write<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function loadLeads() { return read<BusinessLead>(LEADS_KEY); }
export function loadAppointments() { return read<BusinessAppointment>(APPOINTMENTS_KEY); }
export function businessOsEventName() { return EVENT; }

export async function hydrateBusinessOSFromCloud() {
  if (typeof window === "undefined") return;
  try {
    const [cloudLeads, cloudAppointments] = await Promise.all([
      cloudList<BusinessLead>("leads"),
      cloudList<BusinessAppointment>("appointments"),
    ]);
    if (cloudLeads.length) write(LEADS_KEY, mergeById(loadLeads(), cloudLeads));
    if (cloudAppointments.length) write(APPOINTMENTS_KEY, mergeById(loadAppointments(), cloudAppointments));
  } catch {
    // Local mode remains the safe fallback when Firebase is unavailable or not configured.
  }
}

function mergeById<T extends { id: string; updatedAt?: string }>(local: T[], remote: T[]) {
  const map = new Map(local.map(item => [item.id, item]));
  for (const item of remote) {
    const current = map.get(item.id);
    if (!current || (item.updatedAt || "") >= (current.updatedAt || "")) map.set(item.id, item);
  }
  return Array.from(map.values()).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export function createLead(input: Omit<BusinessLead, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const lead: BusinessLead = { ...input, id: `lead:${Date.now()}`, createdAt: now, updatedAt: now };
  write(LEADS_KEY, [lead, ...loadLeads()]);
  void cloudPut("leads", lead.id, lead);
  return lead;
}

export function updateLead(id: string, patch: Partial<BusinessLead>) {
  const items = loadLeads().map(x => x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x);
  write(LEADS_KEY, items);
  const updated = items.find(x => x.id === id);
  if (updated) void cloudPut("leads", updated.id, updated);
}

export function createAppointment(input: Omit<BusinessAppointment, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const appointment: BusinessAppointment = { ...input, id: `appointment:${Date.now()}`, createdAt: now, updatedAt: now };
  write(APPOINTMENTS_KEY, [appointment, ...loadAppointments()]);
  void cloudPut("appointments", appointment.id, appointment);
  updateLead(input.leadId, { appointmentId: appointment.id, status: "Qualified" });
  return appointment;
}

export function updateAppointment(id: string, patch: Partial<BusinessAppointment>) {
  const items = loadAppointments().map(x => x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x);
  write(APPOINTMENTS_KEY, items);
  const updated = items.find(x => x.id === id);
  if (updated) void cloudPut("appointments", updated.id, updated);
}
