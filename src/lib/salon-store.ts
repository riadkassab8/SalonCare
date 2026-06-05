import { useSyncExternalStore } from "react";

export type Status = "confirmed" | "waiting" | "canceled";

export type Appointment = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  phone: string;
  serviceId: string;
  status: Status;
  createdAt: number;
};

export type Service = { id: string; name: string; durationMin: number; price: number };

export type Settings = {
  salonName: string;
  ownerName: string;
  workingHours: { start: string; end: string };
  services: Service[];
};

type State = {
  appointments: Appointment[];
  settings: Settings;
};

const STORAGE_KEY = "salon-state-v1";

const defaultSettings: Settings = {
  salonName: "Beauty Salon",
  ownerName: "أحمد محمد",
  workingHours: { start: "09:00", end: "17:00" },
  services: [
    { id: "s1", name: "قص شعر", durationMin: 30, price: 150 },
    { id: "s2", name: "صبغة شعر", durationMin: 90, price: 600 },
    { id: "s3", name: "مكياج", durationMin: 60, price: 400 },
    { id: "s4", name: "مانيكير", durationMin: 45, price: 200 },
  ],
};

const today = new Date();
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const seedAppointments: Appointment[] = [
  { id: "a1", date: iso(today), time: "10:00", name: "سارة أحمد", phone: "+201123456789", serviceId: "s1", status: "confirmed", createdAt: Date.now() - 86400000 * 2 },
  { id: "a2", date: iso(today), time: "10:30", name: "محمد علي", phone: "+201009876543", serviceId: "s2", status: "confirmed", createdAt: Date.now() - 86400000 },
  { id: "a3", date: iso(today), time: "11:00", name: "نورهان محمود", phone: "+201152234455", serviceId: "s3", status: "waiting", createdAt: Date.now() - 3600000 * 5 },
  { id: "a4", date: iso(today), time: "11:30", name: "أسماء إبراهيم", phone: "+201023345566", serviceId: "s4", status: "confirmed", createdAt: Date.now() - 3600000 * 3 },
  { id: "a5", date: iso(today), time: "12:00", name: "هاني صالح", phone: "+201116677889", serviceId: "s1", status: "canceled", createdAt: Date.now() - 3600000 },
  { id: "a6", date: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)), time: "09:30", name: "ليلى حسن", phone: "+201001112222", serviceId: "s2", status: "confirmed", createdAt: Date.now() },
];

let state: State = { appointments: seedAppointments, settings: defaultSettings };

const listeners = new Set<() => void>();

const load = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
};
load();

const persist = () => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
};

const emit = () => { persist(); listeners.forEach(l => l()); };

export const store = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },

  addAppointment(a: Omit<Appointment, "id" | "createdAt" | "status"> & { status?: Status }) {
    const next: Appointment = {
      id: "a" + Math.random().toString(36).slice(2, 9),
      createdAt: Date.now(),
      status: a.status ?? "waiting",
      ...a,
    };
    state = { ...state, appointments: [next, ...state.appointments] };
    emit();
    return next;
  },
  updateAppointment(id: string, patch: Partial<Appointment>) {
    state = { ...state, appointments: state.appointments.map(a => a.id === id ? { ...a, ...patch } : a) };
    emit();
  },
  removeAppointment(id: string) {
    state = { ...state, appointments: state.appointments.filter(a => a.id !== id) };
    emit();
  },
  updateSettings(patch: Partial<Settings>) {
    state = { ...state, settings: { ...state.settings, ...patch } };
    emit();
  },
  addService(s: Omit<Service, "id">) {
    const ns: Service = { id: "s" + Math.random().toString(36).slice(2, 9), ...s };
    state = { ...state, settings: { ...state.settings, services: [...state.settings.services, ns] } };
    emit();
  },
  removeService(id: string) {
    state = { ...state, settings: { ...state.settings, services: state.settings.services.filter(s => s.id !== id) } };
    emit();
  },
  reset() {
    state = { appointments: seedAppointments, settings: defaultSettings };
    emit();
  },
};

const serverSnap: State = { appointments: [], settings: defaultSettings };
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()), () => selector(serverSnap));
}

export const isoDate = iso;
