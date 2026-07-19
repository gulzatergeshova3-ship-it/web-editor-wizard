import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/program")({ component: Page });

function Page() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => { const { data } = await supabase.from("program_items").select("*").order("sort_order"); setItems(data ?? []); };
  useEffect(() => { load(); }, []);
  const upd = (id: string, patch: any) => setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  const save = async (it: any) => {
    const { error } = await supabase.from("program_items").update({ sort_order: it.sort_order, time_label: it.time_label, title: it.title, description: it.description, speaker: it.speaker }).eq("id", it.id);
    if (error) toast.error(error.message); else toast.success("Сохранено");
  };
  const add = async () => { const { error } = await supabase.from("program_items").insert({ sort_order: items.length + 1, time_label: "", title: {}, description: {} }); if (error) toast.error(error.message); else load(); };
  const del = async (id: string) => { if (!confirm("Удалить?")) return; const { error } = await supabase.from("program_items").delete().eq("id", id); if (error) toast.error(error.message); else load(); };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Программа</h1>
        <Button onClick={add}><Plus className="size-4 mr-2"/>Добавить</Button>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div><Label>Порядок</Label><Input type="number" value={it.sort_order} onChange={(e) => upd(it.id, { sort_order: +e.target.value })}/></div>
              <div><Label>Время</Label><Input value={it.time_label ?? ""} onChange={(e) => upd(it.id, { time_label: e.target.value })}/></div>
              <div className="col-span-2"><Label>Спикер</Label><Input value={it.speaker ?? ""} onChange={(e) => upd(it.id, { speaker: e.target.value })}/></div>
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
