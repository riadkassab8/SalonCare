import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { alerts } from "@/lib/alerts";
import { AdminHeader } from "@/components/admin-sidebar";
import { store, useStore } from "@/lib/salon-store";
import { settingsSchema, serviceSchema, firstError } from "@/lib/validation";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useStore(s => s.settings);
  const [local, setLocal] = useState(settings);
  const [svc, setSvc] = useState({ name: "", durationMin: 30, price: 100 });

  const save = () => {
    const parsed = settingsSchema.safeParse({
      salonName: local.salonName,
      ownerName: local.ownerName,
      workingHours: local.workingHours,
    });
    if (!parsed.success) return alerts.error("بيانات غير صالحة", firstError(parsed.error));
    store.updateSettings(parsed.data);
    alerts.success("تم حفظ الإعدادات");
  };

  const addSvc = () => {
    const parsed = serviceSchema.safeParse(svc);
    if (!parsed.success) return alerts.error("بيانات غير صالحة", firstError(parsed.error));
    store.addService(parsed.data);
    setSvc({ name: "", durationMin: 30, price: 100 });
    alerts.success("تمت إضافة الخدمة");
  };

  return (
    <>
      <AdminHeader title="الإعدادات" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold">معلومات الصالون</h3>
          <div className="space-y-3">
            <Field label="اسم الصالون">
              <input value={local.salonName} onChange={e => setLocal({ ...local, salonName: e.target.value })} maxLength={80} className="input" />
            </Field>
            <Field label="اسم المالك">
              <input value={local.ownerName} onChange={e => setLocal({ ...local, ownerName: e.target.value })} maxLength={60} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="بداية العمل"><input type="time" value={local.workingHours.start} onChange={e => setLocal({ ...local, workingHours: { ...local.workingHours, start: e.target.value } })} className="input" /></Field>
              <Field label="نهاية العمل"><input type="time" value={local.workingHours.end} onChange={e => setLocal({ ...local, workingHours: { ...local.workingHours, end: e.target.value } })} className="input" /></Field>
            </div>
            <button onClick={save} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">حفظ التعديلات</button>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold">الخدمات</h3>
          <div className="space-y-2">
            {settings.services.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.durationMin} د • {s.price} ج.م</div>
                </div>
                <button onClick={async () => { if (await alerts.confirm("حذف الخدمة؟", "ستُحذف الخدمة نهائياً.")) { store.removeService(s.id); alerts.success("تم الحذف"); } }} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr,90px,90px,auto]">
            <input placeholder="اسم الخدمة" maxLength={60} value={svc.name} onChange={e => setSvc({ ...svc, name: e.target.value })} className="input" />
            <input type="number" min={5} max={480} placeholder="دقيقة" value={svc.durationMin} onChange={e => setSvc({ ...svc, durationMin: +e.target.value })} className="input" />
            <input type="number" min={0} max={1000000} placeholder="السعر" value={svc.price} onChange={e => setSvc({ ...svc, price: +e.target.value })} className="input" />
            <button onClick={addSvc} className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" /> إضافة
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-destructive/30 bg-card p-5 shadow-sm xl:col-span-2">
          <h3 className="mb-2 text-base font-bold text-destructive">إعادة ضبط</h3>
          <p className="mb-3 text-xs text-muted-foreground">حذف كل المواعيد والإعدادات والعودة للبيانات الافتراضية.</p>
          <button onClick={async () => { if (await alerts.confirm("هل أنت متأكد؟", "سيتم حذف كل المواعيد والإعدادات.", "نعم، أعد الضبط")) { store.reset(); alerts.success("تمت الإعادة"); setLocal(store.get().settings); } }} className="inline-flex items-center gap-2 rounded-xl border border-destructive bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
            <RotateCcw className="h-4 w-4" /> إعادة ضبط
          </button>
        </section>
      </div>

      <style>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--input); background: var(--card); padding: 0.625rem 0.875rem; font-size: 0.875rem; outline: none; } .input:focus { border-color: var(--primary); }`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
