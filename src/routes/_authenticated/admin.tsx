import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Image, FileText, Layers, Users, Calendar, Building2, Mail, LogOut, Globe, Atom, ScanLine, UserCheck, PanelBottom, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { to: "/admin/participants", label: "Participants", icon: UserCheck },
  { to: "/admin/checkin", label: "Check-in", icon: ScanLine },
  { to: "/admin/hero", label: "Hero / шапка", icon: Image },
  { to: "/admin/about", label: "О конференции", icon: FileText },
  { to: "/admin/sections", label: "Направления", icon: Layers },
  { to: "/admin/speakers", label: "Спикеры", icon: Users },
  { to: "/admin/program", label: "Программа", icon: Calendar },
  { to: "/admin/register-page", label: "Страница регистрации", icon: FileText },
  { to: "/admin/partners", label: "Партнёры", icon: Building2 },
  { to: "/admin/footer", label: "Footer Settings", icon: PanelBottom },
  { to: "/admin/email-settings", label: "Email (Resend)", icon: Mail },
  { to: "/admin/registrations", label: "Заявки (raw)", icon: Mail },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);


  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/auth" }); return; }
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      if (error) { toast.error(error.message); }
      setIsAdmin(!!data);
    })();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (isAdmin === null) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Загрузка…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center rounded-2xl border border-border bg-card p-8">
          <h1 className="text-xl font-bold">Доступ только для администратора</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ваш аккаунт авторизован, но не имеет роли <code>admin</code>. Обратитесь к владельцу проекта, чтобы выдать роль.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate({ to: "/" })}><Globe className="size-4 mr-2"/>На сайт</Button>
            <Button variant="outline" onClick={() => navigate({ to: "/setup-admin" })}>Setup admin</Button>
            <Button onClick={logout}><LogOut className="size-4 mr-2"/>Выйти</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-sidebar text-sidebar-foreground px-3 py-2">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <div className="size-8 shrink-0 rounded-lg bg-primary grid place-items-center text-primary-foreground"><Atom className="size-4"/></div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-bold truncate">Science Tech</div>
            <div className="text-[10px] text-muted-foreground truncate">Админ кабинет</div>
          </div>
        </Link>
        <button onClick={() => setMenuOpen(true)} aria-label="Меню" className="shrink-0 p-2 rounded-lg hover:bg-sidebar-accent"><Menu className="size-5"/></button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85%] h-full bg-sidebar text-sidebar-foreground p-4 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center gap-2 min-w-0">
                <div className="size-9 shrink-0 rounded-lg bg-primary grid place-items-center text-primary-foreground"><Atom className="size-4"/></div>
                <div className="leading-tight min-w-0"><div className="text-sm font-bold truncate">Science Tech</div><div className="text-[10px] text-muted-foreground truncate">Админ кабинет</div></div>
              </Link>
              <button onClick={() => setMenuOpen(false)} aria-label="Закрыть" className="p-2 rounded-lg hover:bg-sidebar-accent"><X className="size-5"/></button>
            </div>
            <NavList pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <div className="space-y-1 pt-2 mt-2 border-t border-sidebar-border">
              <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><Globe className="size-4"/> Перейти на сайт</Link>
              <button onClick={logout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><LogOut className="size-4"/> Выйти</button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground p-4 flex-col">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="size-9 rounded-lg bg-primary grid place-items-center text-primary-foreground"><Atom className="size-4"/></div>
          <div className="leading-tight">
            <div className="text-sm font-bold">Science Tech</div>
            <div className="text-[10px] text-muted-foreground">Админ кабинет</div>
          </div>
        </Link>
        <nav className="mt-6 space-y-1 flex-1">
          <NavList pathname={pathname} />
        </nav>
        <div className="space-y-1 pt-2 border-t border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><Globe className="size-4"/> Перейти на сайт</Link>
          <button onClick={logout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"><LogOut className="size-4"/> Выйти</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="space-y-1 flex-1">
      {nav.map((n) => {
        const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
        const Icon = n.icon;
        return (
          <Link key={n.to} to={n.to} onClick={onNavigate} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}>
            <Icon className="size-4 shrink-0"/> <span className="truncate">{n.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

