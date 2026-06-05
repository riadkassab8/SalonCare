import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";
import { AdminHeader } from "@/components/admin-sidebar";
import { useStore } from "@/lib/salon-store";

export const Route = createFileRoute("/admin/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const appointments = useStore(s => s.appointments);
  const [q, setQ] = useState("");

  const clients = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number; lastDate: string }>();
    for (const a of appointments) {
      const key = a.phone;
      const ex = map.get(key);
      if (!ex) map.set(key, { name: a.name, phone: a.phone, count: 1, lastDate: a.date });
      else { ex.count++; if (a.date > ex.lastDate) ex.lastDate = a.date; }
    }
    return Array.from(map.values())
      .filter(c => !q || c.name.includes(q) || c.phone.includes(q))
      .sort((a, b) => b.count - a.count);
  }, [appointments, q]);

  return (
    <>
      <AdminHeader title="العملاء" />

      <div className="mb-4 relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث" className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-4 text-sm outline-none focus:border-primary" />
      </div>

      {clients.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">لا يوجد عملاء بعد</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map(c => (
            <div key={c.phone} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold">{c.name}</div>
                <div className="truncate text-[11px] text-muted-foreground" dir="ltr">{c.phone}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{c.count} زيارة • آخر موعد {c.lastDate}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
