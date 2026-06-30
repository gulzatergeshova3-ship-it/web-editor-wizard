import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/partners")({ component: Page });

function Page() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => { const { data } = await supabase.from("partners").select("*").order("sort_order"); setItems(data ?? []); };
  useEffect(() => { load(); }, []);
  const upd = (id: string, patch: any) => setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  const save = async (it: any) => {
    const { error } = await supabase.from("partners").update({ sort_order: it.sort_order, name: it.name, logo_url: it.logo_url, url: it.url, tier: it.tier }).eq("id", it.id);
    if (error) toast.error(error.message); else toast.success("Сохранено");
  };
  const add = async () => { const { error } = await supabase.from("partners").insert({ sort_order: items.length + 1, name: "Новый партнёр" }); if (error) toast.error(error.message); else load(); };
  const del = async (id: string) => { if (!confirm("Удалить?")) return; const { error } = await supabase.from("partners").delete().eq("id", id); if (error) toast.error(error.message); else load(); };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Партнёры</h1>
        <Button onClick={add}><Plus className="size-4 mr-2"/>Добавить</Button>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="grid md:grid-cols-4 gap-3">
              <div><Label>Порядок</Label><Input type="number" value={it.sort_order} onChange={(e) => upd(it.id, { sort_order: +e.target.value })}/></div>
              <div className="md:col-span-2"><Label>Название</Label><Input value={it.name} onChange={(e) => upd(it.id, { name: e.target.value })}/></div>
              <div><Label>Уровень</Label><Input value={it.tier ?? ""} onChange={(e) => upd(it.id, { tier: e.target.value })}/></div>
            </div>
            <div className="grid md:grid-cols-2 gap-3 items-start">
              <ImageUpload label="Логотип" value={it.logo_url} folder="partners" onChange={(url) => { upd(it.id, { logo_url: url }); supabase.from("partners").update({ logo_url: url }).eq("id", it.id).then(() => {}); }}/>
              <div><Label>Ссылка</Label><Input value={it.url ?? ""} onChange={(e) => upd(it.id, { url: e.target.value })}/></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => save(it)} className="bg-gradient-brand text-white border-0">Сохранить</Button>
              <Button size="sm" variant="destructive" onClick={() => del(it.id)}><Trash2 className="size-4"/></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
