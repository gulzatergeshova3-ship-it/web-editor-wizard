import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, KeyRound, CheckCircle2, AlertTriangle, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getResendKeyStatus, setResendKey, deleteResendKey } from "@/lib/app-secrets.functions";

export const Route = createFileRoute("/_authenticated/admin/email-settings")({ component: Page });

type Status = Awaited<ReturnType<typeof getResendKeyStatus>>;

function Page() {
  const getStatus = useServerFn(getResendKeyStatus);
  const setKey = useServerFn(setResendKey);
  const delKey = useServerFn(deleteResendKey);

  const [status, setStatus] = useState<Status | null>(null);
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try { setStatus(await getStatus({} as any)); }
    catch (e: any) { toast.error(e?.message ?? "Ошибка"); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    try {
      await setKey({ data: { value: value.trim() } });
      toast.success("Ключ сохранён и проверен через Resend");
      setValue("");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Не удалось сохранить");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirm("Удалить сохранённый ключ из базы? (запасной ключ из переменных окружения останется активным, если он задан)")) return;
    try {
      await delKey({} as any);
      toast.success("Удалено");
      await refresh();
    } catch (e: any) { toast.error(e?.message ?? "Ошибка"); }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="size-6"/> Настройки email (Resend)</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Ключ используется для отправки писем-подтверждений после регистрации. Значение хранится в защищённой таблице и доступно только серверному коду.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="text-sm font-semibold mb-3">Текущий статус</div>
        {loading || !status ? (
          <div className="text-muted-foreground text-sm">Загрузка…</div>
        ) : (
          <div className="space-y-2 text-sm">
            <StatusRow ok={status.active_source !== "none"}
              label="Активный ключ"
              detail={status.active_source === "db" ? `из базы: ${status.db_masked}` :
                      status.active_source === "env" ? `из переменных окружения: ${status.env_masked}` :
                      "не задан — письма не отправляются"} />
            <div className="text-xs text-muted-foreground pl-6">
              В базе: {status.db_set ? `${status.db_masked} (обновлён ${status.db_updated_at ? new Date(status.db_updated_at).toLocaleString() : "—"})` : "не задан"}<br/>
              В переменных окружения: {status.env_set ? status.env_masked : "не задан"}
            </div>
            {status.db_set && (
              <div className="pt-2">
                <Button size="sm" variant="outline" onClick={remove}><Trash2 className="size-4 mr-2"/>Удалить сохранённый ключ</Button>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={save} className="mt-6 rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2"><KeyRound className="size-4"/> Новый RESEND_API_KEY</div>
          <p className="text-xs text-muted-foreground mt-1">
            Получите ключ на <a className="underline" href="https://resend.com/api-keys" target="_blank" rel="noreferrer">resend.com/api-keys</a> (права: Sending access). Формат <code>re_...</code>. Ключ будет проверен через Resend перед сохранением.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={show ? "text" : "password"}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxx"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
            />
            <button type="button" onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Скрыть" : "Показать"}>
              {show ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
            </button>
          </div>
          <Button type="submit" disabled={saving || value.trim().length < 10}>
            <Save className="size-4 mr-2"/>{saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function StatusRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-start gap-2">
      {ok ? <CheckCircle2 className="size-5 text-emerald-600 mt-0.5"/> : <AlertTriangle className="size-5 text-amber-600 mt-0.5"/>}
      <div><span className="font-medium">{label}:</span> {detail}</div>
    </div>
  );
}
