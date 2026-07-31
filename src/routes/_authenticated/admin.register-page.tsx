import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { DEFAULT_FIELDS, normalizeFields, slugKey, type FieldType, type RegField } from "@/lib/register-fields";

export const Route = createFileRoute("/_authenticated/admin/register-page")({ component: Page });

const TEXT_FIELDS: { key: string; label: string; textarea?: boolean }[] = [
  { key: "title", label: "Заголовок страницы" },
  { key: "subtitle", label: "Подзаголовок (дата · город)" },
  { key: "consent", label: "Текст согласия", textarea: true },
  { key: "submit", label: "Кнопка отправки" },
  { key: "success_title", label: "Успех: заголовок" },
  { key: "success_msg", label: "Успех: сообщение", textarea: true },
];

const TYPES: { v: FieldType; l: string }[] = [
  { v: "text", l: "Текст" },
  { v: "email", l: "Email" },
  { v: "tel", l: "Телефон" },
  { v: "textarea", l: "Многострочный" },
  { v: "select", l: "Список" },
];

function Page() {
  const [value, setValue] = useState<any>({});
  const [fields, setFields] = useState<RegField[]>(DEFAULT_FIELDS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["register_page", "register_fields"])
      .then(({ data }) => {
        const map: Record<string, any> = {};
        for (const r of data ?? []) map[r.key] = r.value;
        setValue(map.register_page ?? {});
        setFields(normalizeFields(map.register_fields));
      });
  }, []);

  const save = async () => {
    const keys = fields.map((f) => f.key);
    if (keys.some((k) => !k)) return toast.error("У каждого поля должен быть ключ");
    if (new Set(keys).size !== keys.length) return toast.error("Ключи полей должны быть уникальными");
    if (!fields.some((f) => f.key === "full_name" && f.enabled) || !fields.some((f) => f.key === "email" && f.enabled))
      return toast.error("Поля ФИО и Email обязательны и не могут быть выключены");

    setLoading(true);
    const { error } = await supabase.from("site_settings").upsert([
      { key: "register_page", value },
      { key: "register_fields", value: { fields } as any },
    ]);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Сохранено");
  };

  const updField = (i: number, patch: Partial<RegField>) =>
    setFields((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const move = (i: number, dir: -1 | 1) =>
    setFields((f) => {
      const next = [...f];
      const j = i + dir;
      if (j < 0 || j >= next.length) return f;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const remove = (i: number) => {
    const f = fields[i];
    if (f.key === "full_name" || f.key === "email") return toast.error("Это поле нельзя удалить");
    setFields((prev) => prev.filter((_, idx) => idx !== i));
  };

  const add = () =>
    setFields((f) => [
      ...f,
      { key: `field_${f.length + 1}`, label: { ru: "Новое поле", en: "New field", kg: "Жаңы талаа" }, type: "text", required: false, enabled: true },
    ]);

  return (
    <div className="max-w-4xl pb-16">
      <h1 className="text-2xl font-bold">Страница регистрации</h1>
      <p className="mt-1 text-sm text-muted-foreground">Тексты и поля формы регистрации на RU / EN / KG.</p>

      <h2 className="mt-8 text-lg font-semibold">Поля формы</h2>
      <div className="mt-4 space-y-4">
        {fields.map((f, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono px-2 py-1 rounded bg-muted">{f.key}</span>
              {f.builtin && <span className="text-[10px] uppercase text-muted-foreground">системное</span>}
              <div className="ml-auto flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => move(i, -1)}><ArrowUp className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => move(i, 1)}><ArrowDown className="size-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(i)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            </div>

            <LocalizedField label="Название поля" value={f.label} onChange={(v) => updField(i, { label: v })} />

            <div className="grid gap-4 md:grid-cols-2">
              {!f.builtin && (
                <div>
                  <Label className="mb-1.5 block text-xs">Ключ (латиницей)</Label>
                  <Input value={f.key} onChange={(e) => updField(i, { key: slugKey(e.target.value) })} />
                </div>
              )}
              <div>
                <Label className="mb-1.5 block text-xs">Тип</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={f.type}
                  onChange={(e) => updField(i, { type: e.target.value as FieldType })}
                  disabled={f.key === "email"}
                >
                  {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </div>
            </div>

            {f.type === "select" && (
              <div>
                <Label className="mb-1.5 block text-xs">Варианты (по одному в строке)</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-background p-3 text-sm"
                  rows={3}
                  value={(f.options ?? []).join("\n")}
                  onChange={(e) => updField(i, { options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={f.required} onCheckedChange={(v) => updField(i, { required: v })} /> Обязательное
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={f.enabled} onCheckedChange={(v) => updField(i, { enabled: v })} /> Показывать
              </label>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={add} className="gap-2"><Plus className="size-4" /> Добавить поле</Button>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Тексты страницы</h2>
      <div className="mt-4 space-y-5">
        {TEXT_FIELDS.map((f) => (
          <LocalizedField
            key={f.key}
            label={f.label}
            textarea={f.textarea}
            rows={2}
            value={value[f.key]}
            onChange={(v) => setValue({ ...value, [f.key]: v })}
          />
        ))}
      </div>

      <Button onClick={save} disabled={loading} className="mt-8 bg-primary text-primary-foreground border-0">
        {loading ? "..." : "Сохранить"}
      </Button>
    </div>
  );
}
