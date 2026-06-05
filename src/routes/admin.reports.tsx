import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { AdminHeader } from "@/components/admin-sidebar";
import { useStore, isoDate } from "@/lib/salon-store";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

const COLORS = ["var(--primary)", "oklch(0.7 0.18 160)", "oklch(0.75 0.18 60)", "oklch(0.65 0.22 25)"];

function ReportsPage() {
  const appointments = useStore(s => s.appointments);
  const services = useStore(s => s.settings.services);

  const last30 = useMemo(() => {
    const arr: { d: string; v: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = isoDate(d);
      arr.push({ d: `${d.getDate()}/${d.getMonth() + 1}`, v: appointments.filter(a => a.date === key).length });
    }
    return arr;
  }, [appointments]);

  const byService = useMemo(() => services.map(s => ({
    name: s.name,
    value: appointments.filter(a => a.serviceId === s.id).length,
  })).filter(x => x.value > 0), [appointments, services]);

  const revenue = useMemo(() => {
    return appointments
      .filter(a => a.status === "confirmed")
      .reduce((sum, a) => sum + (services.find(s => s.id === a.serviceId)?.price ?? 0), 0);
  }, [appointments, services]);

  return (
    <>
      <AdminHeader title="التقارير" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="إجمالي المواعيد" value={appointments.length} />
        <Card label="المؤكدة" value={appointments.filter(a => a.status === "confirmed").length} />
        <Card label="إجمالي الإيرادات" value={`${revenue.toLocaleString("ar-EG")} ج.م`} />
      </div>

      <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold">المواعيد آخر 30 يوم</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last30}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="d" tick={{ fontSize: 10 }} reversed />
              <YAxis tick={{ fontSize: 10 }} orientation="right" allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, direction: "rtl" }} />
              <Bar dataKey="v" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {byService.length > 0 && (
        <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold">التوزيع حسب الخدمة</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byService} dataKey="value" nameKey="name" outerRadius={100} label={{ fontSize: 11 }}>
                  {byService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, direction: "rtl" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
