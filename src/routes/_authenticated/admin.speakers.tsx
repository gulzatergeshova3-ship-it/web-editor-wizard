import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/speakers")({ component: Page });

function Page() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => { const { data } = await supabase.from("speakers").select("*").order("sort_order"); setItems(data ?? []); };
  useEffect(() => { load(); }, []);
  const upd = (id: string, patch: any) => setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  const save = async (it: any) => {
    const { error } = await supabase.from("speakers").update({ sort_order: it.sort_order, name: it.name, title: it.title, bio: it.bio, photo_url: it.photo_url }).eq("id", it.id);
    if (error) toast.error(error.message); else toast.success("Сохранено");
  };
  const add = async () => { const { error } = await supabase.from("speakers").insert({ sort_order: items.length + 1, name: { ru: "Новый спикер", en: "New speaker", kg: "Жаңы спикер" }, title: {}, bio: {} }); if (error) toast.error(error.message); else load(); };
  const del = async (id: string) => { if (!confirm("Удалить?")) return; const { error } = await supabase.from("speakers").delete().eq("id", id); if (error) toast.error(error.message); else load(); };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Спикеры</h1>
        <Button onClick={add}><Plus className="size-4 mr-2"/>Добавить</Button>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Порядок</Label><Input type="number" value={it.sort_order} onChange={(e) => upd(it.id, { sort_order: +e.target.value })}/></div>
              <div className="col-span-2"><Label>Имя</Label><Input value={it.name} onChange={(e) => upd(it.id, { name: e.target.value })}/></div>
            </div>
            <ImageUpload label="Фотография" value={it.photo_url} folder="speakers" onChange={(url) => { upd(it.id, { photo_url: url }); supabase.from("speakers").update({ photo_url: url }).eq("id", it.id).then(() => {}); }}/>
            <LocalizedField label="Должность / организация" value={it.title} onChange={(v) => upd(it.id, { title: v })}/>
            <LocalizedField label="Био" value={it.bio} onChange={(v) => upd(it.id, { bio: v })} textarea/>
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
