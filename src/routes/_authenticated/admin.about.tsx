import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LocalizedField, LocalizedArrayField } from "@/components/admin/LocalizedField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/about")({ component: Page });

function Page() {
  const [about, setAbout] = useState<any>({});
  const [contacts, setContacts] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("key,value").in("key", ["about", "contacts"]).then(({ data }) => {
      for (const row of data ?? []) {
        if (row.key === "about") setAbout(row.value);
        if (row.key === "contacts") setContacts(row.value);
      }
    });
  }, []);

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from("site_settings").upsert([
      { key: "about", value: about },
      { key: "contacts", value: contacts },
    ]);
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Сохранено");
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">О конференции и контакты</h1>
      <div className="mt-6 space-y-5">
        <LocalizedField label="Заголовок раздела «О конференции»" value={about.title} onChange={(v) => setAbout({ ...about, title: v })}/>
        <LocalizedArrayField label="Абзацы описания" value={about.paragraphs} onChange={(v) => setAbout({ ...about, paragraphs: v })}/>

        <h2 className="text-xl font-bold pt-6">Контакты</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={contacts.email ?? ""} onChange={(e) => setContacts({ ...contacts, email: e.target.value })}/>
          </div>
          <div>
            <label className="text-sm font-semibold">Телефон</label>
            <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={contacts.phone ?? ""} onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}/>
          </div>
        </div>
        <LocalizedField label="Адрес" value={contacts.address} onChange={(v) => setContacts({ ...contacts, address: v })}/>
        <Button onClick={save} disabled={loading} className="bg-gradient-brand text-white border-0">{loading ? "..." : "Сохранить"}</Button>
      </div>
    </div>
  );
}
