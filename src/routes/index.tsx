import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Scissors, Menu, User, Phone, ShieldCheck, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { alerts } from "@/lib/alerts";
import { store, useStore, isoDate } from "@/lib/salon-store";
import { bookingSchema, firstError } from "@/lib/validation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beauty Salon — احجز موعدك" },
      { name: "description", content: "احجز موعدك في صالون الجمال بسهولة" },
    ],
  }),
  component: BookingPage,
});

const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const TIMES = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: { day: number; current: boolean; date: Date }[] = [];
  for (let i = startDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false, date: new Date(year, month - 1, prevDays - i) });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true, date: new Date(year, month, d) });
  while (cells.length % 7 !== 0) {
    const next = cells.length - daysInMonth - startDay + 1;
    cells.push({ day: next, current: false, date: new Date(year, month + 1, next) });
  }
  return cells;
}

function BookingPage() {
  const [step, setStep] = useState(1);
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState<string>("");
  const [done, setDone] = useState(false);

  const settings = useStore(s => s.settings);
  const appointments = useStore(s => s.appointments);
  const cells = useMemo(() => buildMonth(view.y, view.m), [view]);
  const monthName = new Date(view.y, view.m, 1).toLocaleDateString("ar-EG", { month: "long", year: "numeric" });

  const takenTimes = useMemo(() => {
    if (!selected) return new Set<string>();
    const key = isoDate(selected);
    return new Set(appointments.filter(a => a.date === key && a.status !== "canceled").map(a => a.time));
  }, [selected, appointments]);

  const submit = () => {
    const parsed = bookingSchema.safeParse({
      name,
      phone,
      serviceId,
      date: selected ? isoDate(selected) : "",
      time: time ?? "",
    });
    if (!parsed.success) return alerts.error("بيانات ناقصة", firstError(parsed.error));
    const a = store.addAppointment({ ...parsed.data, status: "waiting" });
    setDone(true);
    alerts.booked(a.date, a.time, a.phone);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-12 pt-6">
        <header className="flex items-center justify-between">
          <button className="rounded-lg p-2 hover:bg-secondary"><Menu className="h-5 w-5" /></button>
          <div className="flex items-center gap-2">
            <div>
              <div className="text-sm font-bold">Beauty Salon</div>
              <div className="text-[10px] text-muted-foreground">نحن نهتم بجمالك</div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
              <Scissors className="h-4 w-4" />
            </div>
          </div>
          <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary">الأدمن</Link>
        </header>

        {done ? (
          <div className="mt-16 rounded-2xl bg-card p-8 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-bold">تم تأكيد حجزك!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {selected?.toLocaleDateString("ar-EG")} — {time}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">سنتواصل معك على {phone}</p>
            <button onClick={() => { setDone(false); setStep(1); setSelected(null); setTime(null); setName(""); setPhone(""); setServiceId(""); }} className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">حجز جديد</button>
          </div>
        ) : (
          <>
            <div className="mt-8 text-center">
              <h1 className="text-2xl font-bold">احجز موعدك الآن</h1>
              <p className="mt-1 text-sm text-muted-foreground">اختر التاريخ والوقت المناسب لك</p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {[1, 2, 3].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{s}</div>
                  {i < 2 && <div className={`mx-2 h-0.5 w-12 ${step > s ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-center gap-8 text-[11px] text-muted-foreground">
              <span>اختر التاريخ</span><span>اختر الوقت</span><span>بياناتك</span>
            </div>

            {step === 1 && (
              <div className="mt-6 rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between px-2 pb-3">
                  <button onClick={() => setView(v => ({ y: v.m === 0 ? v.y - 1 : v.y, m: v.m === 0 ? 11 : v.m - 1 }))} className="rounded-md p-1 hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
                  <span className="text-sm font-semibold">{monthName}</span>
                  <button onClick={() => setView(v => ({ y: v.m === 11 ? v.y + 1 : v.y, m: v.m === 11 ? 0 : v.m + 1 }))} className="rounded-md p-1 hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
                  {AR_DAYS.map(d => <div key={d} className="py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((c, i) => {
                    const isSel = selected && c.date.toDateString() === selected.toDateString();
                    return (
                      <button key={i} onClick={() => c.current && setSelected(c.date)} className={`aspect-square rounded-full text-sm transition ${!c.current ? "text-muted-foreground/40" : isSel ? "bg-primary text-primary-foreground font-bold" : "hover:bg-primary-soft"}`}>{c.day}</button>
                    );
                  })}
                </div>
                <button disabled={!selected} onClick={() => setStep(2)} className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">التالي</button>
              </div>
            )}

            {step === 2 && (
              <div className="mt-6">
                <h3 className="text-center text-base font-semibold">اختر الوقت والخدمة</h3>
                <div className="mt-4">
                  <span className="mb-2 block text-xs text-muted-foreground">الخدمة</span>
                  <div className="grid grid-cols-2 gap-2">
                    {settings.services.map(s => (
                      <button key={s.id} onClick={() => setServiceId(s.id)} className={`rounded-xl border p-3 text-right text-sm transition ${serviceId === s.id ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary"}`}>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">{s.durationMin} د • {s.price} ج.م</div>
                      </button>
                    ))}
                  </div>
                </div>
                <span className="mt-4 mb-2 block text-xs text-muted-foreground">الوقت</span>
                <div className="grid grid-cols-4 gap-2">
                  {TIMES.map(t => {
                    const taken = takenTimes.has(t);
                    return (
                      <button key={t} disabled={taken} onClick={() => setTime(t)} className={`rounded-xl border py-2.5 text-sm transition ${taken ? "border-border bg-secondary text-muted-foreground/50 line-through" : time === t ? "border-primary bg-primary text-primary-foreground font-bold" : "border-border bg-card hover:border-primary"}`}>{t}</button>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold">رجوع</button>
                  <button disabled={!time || !serviceId} onClick={() => setStep(3)} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">التالي</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-6">
                <h3 className="text-center text-base font-semibold">بياناتك</h3>
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={name} onChange={e => setName(e.target.value)} maxLength={60} autoComplete="name" placeholder="الاسم الكامل" className="w-full rounded-xl border border-input bg-card py-3 pr-10 pl-4 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} maxLength={11} inputMode="tel" autoComplete="tel" placeholder="رقم الهاتف" className="w-full rounded-xl border border-input bg-card py-3 pr-10 pl-4 text-sm outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setStep(2)} className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold">رجوع</button>
                  <button onClick={submit} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">احجز الآن</button>
                </div>
                <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" /> لن يتم مشاركة بياناتك مع أي جهة أخرى
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
