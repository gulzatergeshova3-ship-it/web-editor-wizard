import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/sections")({ component: Page });

function Page() {
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("sections").select("*").order("sort_order");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const upd = (id: string, patch: any) => setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  const save = async (it: any) => {
    const { error } = await supabase.from("sections").update({ sort_order: it.sort_order, number: it.number, icon: it.icon, title: it.title, description: it.description }).eq("id", it.id);
    if (error) toast.error(error.message); else toast.success("Сохранено");
  };
  const add = async () => {
    const { error } = await supabase.from("sections").insert({ sort_order: items.length + 1, number: String(items.length + 1).padStart(2,"0"), icon: "atom", title: {}, description: {} });
    if (error) toast.error(error.message); else load();
  };
  const del = async (id: string) => {
    if (!confirm("Удалить?")) return;
    const { error } = await supabase.from("sections").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Научные направления</h1>
        <Button onClick={add}><Plus className="size-4 mr-2"/>Добавить</Button>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Порядок</Label><Input type="number" value={it.sort_order} onChange={(e) => upd(it.id, { sort_order: +e.target.value })}/></div>
              <div><Label>Номер</Label><Input value={it.number ?? ""} onChange={(e) => upd(it.id, { number: e.target.value })}/></div>
              <div><Label>Иконка (brain, leaf, heart, building, atom)</Label><Input value={it.icon ?? ""} onChange={(e) => upd(it.id, { icon: e.target.value })}/></div>
            </div>
            <LocalizedField label="Название" value={it.title} onChange={(v) => upd(it.id, { title: v })}/>
            <LocalizedField label="Описание" value={it.description} onChange={(v) => upd(it.id, { description: v })} textarea/>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => save(it)} className="bg-primary text-primary-foreground border-0">Сохранить</Button>
              <Button size="sm" variant="destructive" onClick={() => del(it.id)}><Trash2 className="size-4"/></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
