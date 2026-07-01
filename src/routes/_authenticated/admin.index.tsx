import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, UserCheck, CalendarClock, ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [stats, setStats] = useState({ total: 0, today: 0, checkedIn: 0 });

  useEffect(() => {
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const [{ count: total }, { count: today }, { count: checkedIn }] = await Promise.all([
        supabase.from("registrations").select("*", { count: "exact", head: true }),
        supabase.from("registrations").select("*", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
        supabase.from("registrations").select("*", { count: "exact", head: true }).not("checked_in_at", "is", null),
      ]);
      setStats({ total: total ?? 0, today: today ?? 0, checkedIn: checkedIn ?? 0 });
    })();
  }, []);

  const cards = [
    { label: "Всего регистраций", value: stats.total, icon: Users, color: "from-blue-500 to-indigo-500" },
    { label: "Зарегистрировано сегодня", value: stats.today, icon: CalendarClock, color: "from-emerald-500 to-teal-500" },
    { label: "Прошли Check-in", value: stats.checkedIn, icon: UserCheck, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Обзор регистраций участников конференции Science Tech 2026.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
              <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${c.color}`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{c.label}</div>
                  <div className="mt-2 text-4xl font-bold tabular-nums">{c.value}</div>
                </div>
                <div className={`size-12 rounded-xl bg-gradient-to-br ${c.color} text-white grid place-items-center shadow-lg`}>
                  <Icon className="size-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Link to="/admin/participants" className="rounded-2xl border border-border bg-card p-6 hover:shadow-brand transition flex items-center gap-4">
          <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center"><Users className="size-6"/></div>
          <div>
            <div className="font-semibold">Participants</div>
            <div className="text-sm text-muted-foreground">Таблица с поиском, фильтром и экспортом</div>
          </div>
        </Link>
        <Link to="/admin/checkin" className="rounded-2xl border border-border bg-card p-6 hover:shadow-brand transition flex items-center gap-4">
          <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center"><ScanLine className="size-6"/></div>
          <div>
            <div className="font-semibold">Check-in</div>
            <div className="text-sm text-muted-foreground">Сканирование QR-кодов на входе</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
