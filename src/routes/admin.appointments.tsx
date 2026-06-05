import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Search, X, CheckCircle2, Clock, XCircle } from "lucide-react";
import { alerts } from "@/lib/alerts";
import { AdminHeader } from "@/components/admin-sidebar";
import { store, useStore, type Status } from "@/lib/salon-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAppointmentSchema, firstError } from "@/lib/validation";

export const Route = createFileRoute("/admin/appointments")({
  component: AppointmentsPage,
});

const STATUS_OPTS: { value: Status; label: string; tone: string; dot: string; icon: typeof CheckCircle2 }[] = [
  { value: "confirmed", label: "مؤكد", tone: "bg-success text-success-foreground", dot: "bg-emerald-500", icon: CheckCircle2 },
  { value: "waiting", label: "في الانتظار", tone: "bg-warning text-warning-foreground", dot: "bg-amber-500", icon: Clock },
  { value: "canceled", label: "ملغي", tone: "bg-danger text-danger-foreground", dot: "bg-rose-500", icon: XCircle },
];

function AppointmentsPage() {
  const appointments = useStore(s => s.appointments);
  const services = useStore(s => s.settings.services);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return appointments
      .filter(a => filter === "all" || a.status === filter)
      .filter(a => !q || a.name.includes(q) || a.phone.includes(q))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [appointments, q, filter]);

  return (
    <>
      <AdminHeader title="المواعيد" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث بالاسم أو الهاتف" className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-4 text-sm outline-none focus:border-primary" />
        </div>
        <Select value={filter} onValueChange={v => setFilter(v as Status | "all")}>
          <SelectTrigger className="h-11 w-[150px] flex-1 rounded-xl border-input bg-card px-4 text-sm font-medium shadow-sm sm:flex-none sm:w-[180px]">
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${filter === "all" ? "bg-muted-foreground/40" : STATUS_OPTS.find(s => s.value === filter)?.dot}`} />
              {filter === "all" ? "كل الحالات" : STATUS_OPTS.find(s => s.value === filter)?.label}
            </span>
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            <SelectItem value="all" textValue="كل الحالات">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" />كل الحالات</span>
            </SelectItem>
            {STATUS_OPTS.map(s => (
              <SelectItem key={s.value} value={s.value} textValue={s.label}>
                <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${s.dot}`} />{s.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> موعد جديد
        </button>
      </div>

      <div className="rounded-2xl bg-card p-2 shadow-sm">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">لا توجد مواعيد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="p-3 font-medium">التاريخ</th>
                  <th className="p-3 font-medium">الوقت</th>
                  <th className="p-3 font-medium">العميل</th>
                  <th className="p-3 font-medium">الهاتف</th>
                  <th className="p-3 font-medium">الخدمة</th>
                  <th className="p-3 font-medium">الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const svc = services.find(s => s.id === a.serviceId);
                  return (
                    <tr key={a.id} className="border-b border-border/40 last:border-0">
                      <td className="p-3">{a.date}</td>
                      <td className="p-3 font-semibold">{a.time}</td>
                      <td className="p-3">{a.name}</td>
                      <td className="p-3 text-muted-foreground" dir="ltr">{a.phone}</td>
                      <td className="p-3 text-muted-foreground">{svc?.name ?? "—"}</td>
                      <td className="p-3">
                        <Select
                          value={a.status}
                          onValueChange={v => { store.updateAppointment(a.id, { status: v as Status }); alerts.success("تم تحديث الحالة"); }}
                        >
                          <SelectTrigger className={`h-8 w-[130px] gap-1 rounded-full border-0 px-3 text-xs font-medium shadow-none ${STATUS_OPTS.find(s => s.value === a.status)?.tone}`}>
                            <span className="flex items-center gap-1.5">
                              {(() => {
                                const cur = STATUS_OPTS.find(s => s.value === a.status);
                                if (!cur) return null;
                                const Icon = cur.icon;
                                return <><Icon className="h-3.5 w-3.5" />{cur.label}</>;
                              })()}
                            </span>
                          </SelectTrigger>
                          <SelectContent align="end" className="rounded-xl">
                            {STATUS_OPTS.map(s => (
                              <SelectItem key={s.value} value={s.value} textValue={s.label}>
                                <span className="flex items-center gap-2">
                                  <s.icon className="h-3.5 w-3.5" />
                                  {s.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <button onClick={async () => { if (await alerts.confirm("حذف الموعد؟", "لا يمكن التراجع عن هذا الإجراء.")) { store.removeAppointment(a.id); alerts.success("تم الحذف"); } }} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <AppointmentForm onClose={() => setShowForm(false)} />}
    </>
  );
}

function AppointmentForm({ onClose }: { onClose: () => void }) {
  const services = useStore(s => s.settings.services);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, time: "10:00", name: "", phone: "", serviceId: services[0]?.id ?? "", status: "confirmed" as Status });

  const submit = () => {
    const parsed = adminAppointmentSchema.safeParse(form);
    if (!parsed.success) return alerts.error("بيانات غير صالحة", firstError(parsed.error));
    store.addAppointment(parsed.data);
    alerts.success("تم إضافة الموعد");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold">موعد جديد</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="الاسم"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={60} className="input" /></Field>
          <Field label="الهاتف"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={11} inputMode="tel" dir="ltr" className="input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="التاريخ"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input" /></Field>
            <Field label="الوقت"><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input" /></Field>
          </div>
          <Field label="الخدمة">
            <Select value={form.serviceId} onValueChange={v => setForm({ ...form, serviceId: v })}>
              <SelectTrigger className="h-11 rounded-xl border-input bg-card px-4 text-sm"><SelectValue placeholder="اختر خدمة" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {services.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center justify-between gap-4">
                      <span>{s.name}</span>
                      <span className="text-[11px] text-muted-foreground">{s.price} ج.م</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="الحالة">
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Status })}>
              <SelectTrigger className="h-11 rounded-xl border-input bg-card px-4 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {STATUS_OPTS.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${s.dot}`} />{s.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-border bg-card py-2.5 text-sm">إلغاء</button>
          <button onClick={submit} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">حفظ</button>
        </div>
      </div>
      <style>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--input); background: var(--card); padding: 0.625rem 0.875rem; font-size: 0.875rem; outline: none; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
