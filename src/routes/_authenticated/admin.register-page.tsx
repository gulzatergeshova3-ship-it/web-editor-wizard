import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LocalizedField } from "@/components/admin/LocalizedField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/register-page")({ component: Page });

const FIELDS: { key: string; label: string; textarea?: boolean }[] = [
  { key: "title", label: "Заголовок страницы" },
  { key: "subtitle", label: "Подзаголовок (дата · город)" },
  { key: "f_full_name", label: "Поле: ФИО" },
  { key: "f_email", label: "Поле: Email" },
  { key: "f_phone", label: "Поле: Телефон" },
  { key: "f_org", label: "Поле: Организация" },
  { key: "f_position", label: "Поле: Должность" },
  { key: "f_country", label: "Поле: Страна" },
  { key: "consent", label: "Текст согласия", textarea: true },
  { key: "submit", label: "Кнопка отправки" },
  { key: "success_title", label: "Успех: заголовок" },
  { key: "success_msg", label: "Успех: сообщение", textarea: true },
];

function Page() {
  const [value, setValue] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "register_page")
      .maybeSingle()
      .then(({ data }) => setValue(data?.value ?? {}));
  }, []);

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from("site_settings").upsert({ key: "register_page", value });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Сохранено");
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Страница регистрации</h1>
      <p className="mt-1 text-sm text-muted-foreground">Тексты формы регистрации на RU / EN / KG.</p>
      <div className="mt-6 space-y-5">
        {FIELDS.map((f) => (
          <LocalizedField
            key={f.key}
            label={f.label}
            textarea={f.textarea}
            rows={2}
            value={value[f.key]}
            onChange={(v) => setValue({ ...value, [f.key]: v })}
          />
        ))}
        <Button onClick={save} disabled={loading} className="bg-primary text-primary-foreground border-0">
          {loading ? "..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
