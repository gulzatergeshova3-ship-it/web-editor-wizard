import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [counts, setCounts] = useState({ sections: 0, speakers: 0, program: 0, partners: 0, regs: 0 });
  useEffect(() => {
    (async () => {
      const tables = ["sections", "speakers", "program_items", "partners", "registrations"] as const;
      const result: any = {};
      for (const t of tables) {
        const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
        result[t] = count ?? 0;
      }
      setCounts({ sections: result.sections, speakers: result.speakers, program: result.program_items, partners: result.partners, regs: result.registrations });
    })();
  }, []);

  const cards = [
    { label: "Направления", v: counts.sections, to: "/admin/sections" },
    { label: "Спикеры", v: counts.speakers, to: "/admin/speakers" },
    { label: "Пункты программы", v: counts.program, to: "/admin/program" },
    { label: "Партнёры", v: counts.partners, to: "/admin/partners" },
    { label: "Заявки", v: counts.regs, to: "/admin/registrations" },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold">Кабинет администратора</h1>
      <p className="text-muted-foreground mt-2">Управляйте контентом сайта конференции.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl border border-border bg-card p-6 hover:shadow-brand transition">
            <div className="text-sm text-muted-foreground">{c.label}</div>
            <div className="mt-2 text-3xl font-bold">{c.v}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
