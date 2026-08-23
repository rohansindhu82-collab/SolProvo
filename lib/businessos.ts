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

export function createLead(input: Omit<BusinessLead, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const lead: BusinessLead = { ...input, id: `lead:${Date.now()}`, createdAt: now, updatedAt: now };
  write(LEADS_KEY, [lead, ...loadLeads()]);
  return lead;
}

export function updateLead(id: string, patch: Partial<BusinessLead>) {
  const items = loadLeads().map(x => x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x);
  write(LEADS_KEY, items);
}

export function createAppointment(input: Omit<BusinessAppointment, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const appointment: BusinessAppointment = { ...input, id: `appointment:${Date.now()}`, createdAt: now, updatedAt: now };
  write(APPOINTMENTS_KEY, [appointment, ...loadAppointments()]);
  updateLead(input.leadId, { appointmentId: appointment.id, status: "Qualified" });
  return appointment;
}

export function updateAppointment(id: string, patch: Partial<BusinessAppointment>) {
  const items = loadAppointments().map(x => x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x);
  write(APPOINTMENTS_KEY, items);
}
