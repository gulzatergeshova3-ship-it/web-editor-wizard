import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/hero")({ component: Page });

function Page() {
  const [hero, setHero] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "hero").maybeSingle().then(({ data }) => setHero(data?.value ?? {}));
  }, []);

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from("site_settings").upsert({ key: "hero", value: hero });
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Сохранено");
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Hero / Главный экран</h1>
      <div className="mt-6 space-y-5">
        <LocalizedField label="Бейдж" value={hero.badge} onChange={(v) => setHero({ ...hero, badge: v })}/>
        <LocalizedField label="Заголовок" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} textarea rows={2}/>
        <LocalizedField label="Подзаголовок" value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })}/>
        <LocalizedField label="Дата (подпись)" value={hero.date_label} onChange={(v) => setHero({ ...hero, date_label: v })}/>
        <LocalizedField label="Локация" value={hero.location} onChange={(v) => setHero({ ...hero, location: v })}/>
        <div>
          <Label className="font-semibold">Дата и время события (для обратного отсчёта)</Label>
          <Input type="datetime-local" value={hero.event_date ? new Date(hero.event_date).toISOString().slice(0,16) : ""} onChange={(e) => setHero({ ...hero, event_date: new Date(e.target.value).toISOString() })}/>
        </div>
        <Button onClick={save} disabled={loading} className="bg-primary text-primary-foreground border-0">{loading ? "..." : "Сохранить"}</Button>
      </div>
    </div>
  );
}
