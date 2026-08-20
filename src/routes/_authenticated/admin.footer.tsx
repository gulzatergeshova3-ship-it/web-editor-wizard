import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/footer")({ component: Page });

type LinkItem = { id: string; label: any; url: string; visible: boolean; sort_order: number };
type OrgItem = { id: string; name: string; logo_url: string; sort_order: number };
type ContactItem = { id: string; type: "email" | "phone" | "address" | "link"; value: string; label: any; sort_order: number };


const emptyFooter = () => ({
  main: { name: {}, subtitle: {}, tagline: {}, event_date: {} },
  contacts: { email: "", phone: "", address: {}, maps_url: "" },
  quick_links: [] as LinkItem[],
  organizers: [] as OrgItem[],
  social: { linkedin: "", instagram: "", telegram: "", facebook: "", youtube: "" },
  bottom: { copyright: "", made_by: "", extra: "" },
});

function Page() {
  const [f, setF] = useState<any>(emptyFooter());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "footer").maybeSingle().then(({ data }) => {
      if (data?.value) setF({ ...emptyFooter(), ...(data.value as any) });
    });
  }, []);

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from("site_settings").upsert({ key: "footer", value: f });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Настройки футера успешно сохранены");
  };

  const links: LinkItem[] = useMemo(() => f.quick_links ?? [], [f]);
  const orgs: OrgItem[] = useMemo(() => f.organizers ?? [], [f]);

  const updLinks = (next: LinkItem[]) => setF({ ...f, quick_links: next.map((l, i) => ({ ...l, sort_order: i + 1 })) });
  const updOrgs = (next: OrgItem[]) => setF({ ...f, organizers: next.map((o, i) => ({ ...o, sort_order: i + 1 })) });

  const move = <T,>(arr: T[], i: number, dir: -1 | 1): T[] => {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    const next = arr.slice();
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Footer Settings</h1>
        <Button onClick={save} disabled={loading} className="bg-primary text-primary-foreground border-0">
          {loading ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </div>

      {/* MAIN */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-lg font-bold">Основная информация</h2>
        <LocalizedField label="Название конференции" value={f.main?.name} onChange={(v) => setF({ ...f, main: { ...f.main, name: v } })} />
        <LocalizedField label="Подзаголовок" value={f.main?.subtitle} onChange={(v) => setF({ ...f, main: { ...f.main, subtitle: v } })} />
        <LocalizedField label="Слоган" value={f.main?.tagline} onChange={(v) => setF({ ...f, main: { ...f.main, tagline: v } })} />
        <LocalizedField label="Дата мероприятия" value={f.main?.event_date} onChange={(v) => setF({ ...f, main: { ...f.main, event_date: v } })} />
      </section>

      {/* CONTACTS */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-lg font-bold">Контакты</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Email</Label>
            <Input value={f.contacts?.email ?? ""} onChange={(e) => setF({ ...f, contacts: { ...f.contacts, email: e.target.value } })} />
          </div>
          <div>
            <Label>Телефон</Label>
            <Input value={f.contacts?.phone ?? ""} onChange={(e) => setF({ ...f, contacts: { ...f.contacts, phone: e.target.value } })} />
          </div>
        </div>
        <LocalizedField label="Адрес" value={f.contacts?.address} onChange={(v) => setF({ ...f, contacts: { ...f.contacts, address: v } })} />
        <div>
          <Label>Google Maps (ссылка)</Label>
          <Input value={f.contacts?.maps_url ?? ""} onChange={(e) => setF({ ...f, contacts: { ...f.contacts, maps_url: e.target.value } })} />
        </div>

        {/* Дополнительные контакты */}
        <div className="pt-2 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Дополнительные контакты</h3>
            <Button variant="outline" size="sm" onClick={() => updExtra([...extra, { id: crypto.randomUUID(), type: "phone", value: "", label: {}, sort_order: extra.length + 1 }])}>
              <Plus className="size-4 mr-1" /> Добавить
            </Button>
          </div>
          {extra.map((c, i) => (
            <div key={c.id} className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-2">
                  <button onClick={() => updExtra(move(extra, i, -1))} className="p-1 hover:bg-accent rounded" aria-label="up"><ArrowUp className="size-3" /></button>
                  <button onClick={() => updExtra(move(extra, i, 1))} className="p-1 hover:bg-accent rounded" aria-label="down"><ArrowDown className="size-3" /></button>
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-2">
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={c.type}
                    onChange={(e) => updExtra(extra.map((x, k) => k === i ? { ...x, type: e.target.value as ContactItem["type"] } : x))}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Телефон</option>
                    <option value="address">Адрес</option>
                    <option value="link">Ссылка</option>
                  </select>
                  <Input placeholder="Значение (почта, номер, адрес, URL)" value={c.value} onChange={(e) => updExtra(extra.map((x, k) => k === i ? { ...x, value: e.target.value } : x))} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => updExtra(extra.filter((_, k) => k !== i))}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
              <LocalizedField label="Подпись (необязательно)" value={c.label} onChange={(v) => updExtra(extra.map((x, k) => k === i ? { ...x, label: v } : x))} />
            </div>
          ))}
          {extra.length === 0 && <div className="text-sm text-muted-foreground">Пока нет дополнительных контактов</div>}
        </div>
      </section>


      {/* QUICK LINKS */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Конференция</h2>
          <Button variant="outline" size="sm" onClick={() => updLinks([...links, { id: crypto.randomUUID(), label: {}, url: "", visible: true, sort_order: links.length + 1 }])}>
            <Plus className="size-4 mr-1" /> Добавить
          </Button>
        </div>
        <div className="space-y-3">
          {links.map((l, i) => (
            <div key={l.id} className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button onClick={() => updLinks(move(links, i, -1))} className="p-1 hover:bg-accent rounded" aria-label="up"><ArrowUp className="size-3" /></button>
                  <button onClick={() => updLinks(move(links, i, 1))} className="p-1 hover:bg-accent rounded" aria-label="down"><ArrowDown className="size-3" /></button>
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-2">
                  <Input placeholder="URL или #якорь" value={l.url} onChange={(e) => updLinks(links.map((x, k) => k === i ? { ...x, url: e.target.value } : x))} />
                  <div className="flex items-center gap-2">
                    <Switch checked={l.visible !== false} onCheckedChange={(v) => updLinks(links.map((x, k) => k === i ? { ...x, visible: v } : x))} />
                    <span className="text-sm text-muted-foreground">Показывать</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => updLinks(links.filter((_, k) => k !== i))}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
              <LocalizedField label="Название" value={l.label} onChange={(v) => updLinks(links.map((x, k) => k === i ? { ...x, label: v } : x))} />
            </div>
          ))}
          {links.length === 0 && <div className="text-sm text-muted-foreground">Пока нет ссылок</div>}
        </div>
      </section>

      {/* ORGANIZERS */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Организаторы и партнёры</h2>
          <Button variant="outline" size="sm" onClick={() => updOrgs([...orgs, { id: crypto.randomUUID(), name: "", logo_url: "", sort_order: orgs.length + 1 }])}>
            <Plus className="size-4 mr-1" /> Добавить
          </Button>
        </div>
        <div className="space-y-3">
          {orgs.map((o, i) => (
            <div key={o.id} className="rounded-lg border border-border p-3 flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-6">
                <button onClick={() => updOrgs(move(orgs, i, -1))} className="p-1 hover:bg-accent rounded" aria-label="up"><ArrowUp className="size-3" /></button>
                <button onClick={() => updOrgs(move(orgs, i, 1))} className="p-1 hover:bg-accent rounded" aria-label="down"><ArrowDown className="size-3" /></button>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Название</Label>
                  <Input value={o.name} onChange={(e) => updOrgs(orgs.map((x, k) => k === i ? { ...x, name: e.target.value } : x))} />
                </div>
                <ImageUpload label="Логотип" value={o.logo_url} folder="footer-organizers" onChange={(url) => updOrgs(orgs.map((x, k) => k === i ? { ...x, logo_url: url } : x))} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => updOrgs(orgs.filter((_, k) => k !== i))}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          ))}
          {orgs.length === 0 && <div className="text-sm text-muted-foreground">Пока нет организаторов</div>}
        </div>
      </section>

      {/* SOCIAL */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-lg font-bold">Социальные сети</h2>
        <p className="text-xs text-muted-foreground">Если ссылка не заполнена — иконка не отображается на сайте.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {(["linkedin","instagram","telegram","facebook","youtube"] as const).map((k) => (
            <div key={k}>
              <Label className="capitalize">{k}</Label>
              <Input value={f.social?.[k] ?? ""} placeholder="https://..." onChange={(e) => setF({ ...f, social: { ...f.social, [k]: e.target.value } })} />
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-lg font-bold">Нижняя строка футера</h2>
        <div>
          <Label>Copyright</Label>
          <Input value={f.bottom?.copyright ?? ""} onChange={(e) => setF({ ...f, bottom: { ...f.bottom, copyright: e.target.value } })} />
        </div>
        <div>
          <Label>Made by...</Label>
          <Input value={f.bottom?.made_by ?? ""} onChange={(e) => setF({ ...f, bottom: { ...f.bottom, made_by: e.target.value } })} />
        </div>
        <div>
          <Label>Дополнительная информация</Label>
          <Input value={f.bottom?.extra ?? ""} onChange={(e) => setF({ ...f, bottom: { ...f.bottom, extra: e.target.value } })} />
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={loading} className="bg-primary text-primary-foreground border-0">
          {loading ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </div>
    </div>
  );
}
