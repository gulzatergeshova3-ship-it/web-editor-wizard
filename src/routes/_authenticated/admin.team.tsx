import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listAdmins, createAdminUser, revokeAdminUser } from "@/lib/admin-team.functions";

export const Route = createFileRoute("/_authenticated/admin/team")({
  component: AdminTeamPage,
});

type Row = { id: string; user_id: string; email: string; last_sign_in_at: string | null; is_self: boolean };

function AdminTeamPage() {
  const fetchAdmins = useServerFn(listAdmins);
  const addAdmin = useServerFn(createAdminUser);
  const removeAdmin = useServerFn(revokeAdminUser);

  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    fetchAdmins()
      .then((r) => setRows(r as Row[]))
      .catch((e: any) => toast.error(e.message));
  }, [fetchAdmins]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addAdmin({ data: { email, password } });
      toast.success(`Доступ выдан: ${res.email}`);
      setEmail("");
      setPassword("");
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (user_id: string) => {
    try {
      await removeAdmin({ data: { user_id } });
      toast.success("Доступ снят");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Команда</h1>
      <p className="text-muted-foreground mt-2">
        Добавьте сотрудников — они смогут заходить в админку с любого устройства, включая телефон, и сканировать QR на входе.
      </p>

      <form onSubmit={submit} className="mt-8 rounded-2xl border border-border bg-card p-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end max-w-3xl">
        <div>
          <Label>Email сотрудника</Label>
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Пароль (минимум 8 символов)</Label>
          <Input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground border-0">
          <UserPlus className="size-4 mr-2" /> {loading ? "Добавляю…" : "Добавить"}
        </Button>
      </form>

      <div className="mt-8 rounded-2xl border border-border bg-card divide-y divide-border max-w-3xl">
        {rows.length === 0 && <div className="p-6 text-sm text-muted-foreground">Пока нет ни одного аккаунта.</div>}
        {rows.map((r) => (
          <div key={r.id} className="p-4 flex items-center gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{r.email}{r.is_self && <span className="ml-2 text-xs text-primary">это вы</span>}</div>
              <div className="text-xs text-muted-foreground">
                {r.last_sign_in_at ? `Последний вход: ${new Date(r.last_sign_in_at).toLocaleString("ru-RU")}` : "Ещё не заходил"}
              </div>
            </div>
            {!r.is_self && (
              <Button variant="outline" size="sm" onClick={() => revoke(r.user_id)}>
                <Trash2 className="size-4 mr-2" /> Снять доступ
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
