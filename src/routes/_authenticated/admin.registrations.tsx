import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/registrations")({ component: Page });

function Page() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);
  const del = async (id: string) => {
    if (!confirm("Удалить заявку?")) return;
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold">Заявки на регистрацию ({items.length})</h1>
      <div className="mt-6 rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Дата</th>
              <th className="p-3">Имя</th>
              <th className="p-3">Email</th>
              <th className="p-3">Телефон</th>
              <th className="p-3">Организация</th>
              <th className="p-3">Секция</th>
              <th className="p-3">Сообщение</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-3 font-medium">{r.full_name}</td>
                <td className="p-3"><a className="text-primary" href={`mailto:${r.email}`}>{r.email}</a></td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">{r.organization}</td>
                <td className="p-3">{r.section}</td>
                <td className="p-3 max-w-xs truncate" title={r.message}>{r.message}</td>
                <td className="p-3"><Button size="sm" variant="destructive" onClick={() => del(r.id)}><Trash2 className="size-4"/></Button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Пока нет заявок</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
