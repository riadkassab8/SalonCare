import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarCheck, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AdminHeader } from "@/components/admin-sidebar";
import { useStore, isoDate } from "@/lib/salon-store";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

const AR_DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const toneClasses: Record<string, string> = {
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
};
const statusLabel: Record<string, { label: string; tone: string }> = {
  confirmed: { label: "مؤكد", tone: "success" },
  waiting: { label: "في الانتظار", tone: "warning" },
  canceled: { label: "ملغي", tone: "danger" },
};

function DashboardPage() {
  const appointments = useStore(s => s.appointments);
  const todayStr = isoDate(new Date());
  const todays = appointments.filter(a => a.date === todayStr);

  const stats = useMemo(() => [
    { label: "إجمالي مواعيد اليوم", value: todays.length, color: "info", icon: CalendarCheck },
    { label: "مؤكدة", value: todays.filter(a => a.status === "confirmed").length, color: "success", icon: CheckCircle2 },
    { label: "في الانتظار", value: todays.filter(a => a.status === "waiting").length, color: "warning", icon: Clock },
    { label: "ملغية", value: todays.filter(a => a.status === "canceled").length, color: "danger", icon: XCircle },
  ], [todays]);

  const chartData = useMemo(() => {
    const arr: { d: string; v: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = isoDate(d);
      arr.push({ d: AR_DAY_NAMES[d.getDay()], v: appointments.filter(a => a.date === key).length });
    }
    return arr;
  }, [appointments]);

  return (
    <>
      <AdminHeader title="لوحة التحكم" />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground lg:text-sm">{s.label}</div>
                <div className="mt-2 text-2xl font-bold lg:text-3xl">{s.value}</div>
              </div>
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl lg:h-12 lg:w-12 ${toneClasses[s.color]}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">مواعيد اليوم</h2>
            <Link to="/admin/appointments" className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary">
              عرض الكل <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>
          {todays.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">لا توجد مواعيد اليوم</p>
          ) : (
            <div className="space-y-2">
              {todays.slice(0, 6).map(a => {
                const st = statusLabel[a.status];
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">{a.time}</div>
                      <div>
                        <div className="text-sm font-semibold">{a.name}</div>
                        <div className="text-[11px] text-muted-foreground" dir="ltr">{a.phone}</div>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] ${toneClasses[st.tone]}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold">آخر 7 أيام</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} reversed />
                <YAxis tick={{ fontSize: 10 }} orientation="right" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, direction: "rtl" }} />
                <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
