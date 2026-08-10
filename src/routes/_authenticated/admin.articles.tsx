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

export const Route = createFileRoute("/_authenticated/admin/articles")({ component: Page });

function Page() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => { const { data } = await supabase.from("articles").select("*").order("sort_order"); setItems(data ?? []); };
  useEffect(() => { load(); }, []);
  const upd = (id: string, patch: any) => setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  const save = async (it: any) => {
    const { error } = await supabase.from("articles").update({ sort_order: it.sort_order, name: it.name, title: it.title, bio: it.bio, photo_url: it.photo_url, url: it.url }).eq("id", it.id);
    if (error) toast.error(error.message); else toast.success("Сохранено");
  };
  const add = async () => { const { error } = await supabase.from("articles").insert({ sort_order: items.length + 1, name: { ru: "Новая статья", en: "New article", kg: "Жаңы макала" }, title: {}, bio: {} }); if (error) toast.error(error.message); else load(); };
  const del = async (id: string) => { if (!confirm("Удалить?")) return; const { error } = await supabase.from("articles").delete().eq("id", id); if (error) toast.error(error.message); else load(); };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Научные статьи и доклады</h1>
        <Button onClick={add}><Plus className="size-4 mr-2"/>Добавить</Button>
      </div>
      <div className="mt-6 space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Порядок</Label><Input type="number" value={it.sort_order} onChange={(e) => upd(it.id, { sort_order: +e.target.value })}/></div>
              <div><Label>Ссылка (PDF / страница)</Label><Input value={it.url ?? ""} onChange={(e) => upd(it.id, { url: e.target.value })}/></div>
            </div>
            <ImageUpload label="Обложка" value={it.photo_url} folder="articles" onChange={(url) => { upd(it.id, { photo_url: url }); supabase.from("articles").update({ photo_url: url }).eq("id", it.id).then(() => {}); }}/>
            <LocalizedField label="Название" value={it.name} onChange={(v) => upd(it.id, { name: v })}/>
            <LocalizedField label="Авторы / организация" value={it.title} onChange={(v) => upd(it.id, { title: v })}/>
            <LocalizedField label="Аннотация" value={it.bio} onChange={(v) => upd(it.id, { bio: v })} textarea/>
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
