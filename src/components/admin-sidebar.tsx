import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar as CalIcon, Users, Settings, BarChart3, LogOut, Scissors, Menu, X } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";

type NavItem = { to: string; label: string; icon: typeof Home; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "الرئيسية", icon: Home, exact: true },
  { to: "/admin/appointments", label: "المواعيد", icon: CalIcon },
  { to: "/admin/clients", label: "العملاء", icon: Users },
  { to: "/admin/reports", label: "التقارير", icon: BarChart3 },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
];

const SidebarCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarCtx.Provider value={{ open, setOpen }}>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-6">{children}</main>
      </div>
    </SidebarCtx.Provider>
  );
}

function AdminSidebar() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const { open, setOpen } = useContext(SidebarCtx);

  const NavList = (
    <nav className="flex-1 space-y-1">
      {NAV.map(n => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to as "/admin"}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground/70 hover:bg-white/5"}`}
          >
            <n.icon className="h-4 w-4" />
            <span>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const Brand = (
    <div className="flex items-center gap-3 pb-8">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-sidebar-accent text-sidebar-accent-foreground">
        <Scissors className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-bold text-sidebar-foreground">Beauty Salon</div>
        <div className="text-[11px] text-sidebar-foreground/60">لوحة التحكم</div>
      </div>
    </div>
  );

  const Logout = (
    <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-sidebar-foreground/70 hover:bg-white/5">
      <LogOut className="h-4 w-4" />
      <span>تسجيل الخروج</span>
    </Link>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar p-5 lg:flex">
        {Brand}
        {NavList}
        {Logout}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-sidebar p-5">
            <button onClick={() => setOpen(false)} className="self-start rounded-lg p-1 text-sidebar-foreground/70 hover:bg-white/5">
              <X className="h-5 w-5" />
            </button>
            <div className="mt-2">{Brand}</div>
            {NavList}
            {Logout}
          </aside>
        </div>
      )}
    </>
  );
}

export function AdminHeader({ title }: { title: string }) {
  const { setOpen } = useContext(SidebarCtx);
  return (
    <header className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg bg-card p-2 shadow-sm lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-bold lg:text-2xl">{title}</h1>
      </div>
      <Link to="/" className="shrink-0 text-xs text-muted-foreground hover:text-primary">عرض الموقع</Link>
    </header>
  );
}
