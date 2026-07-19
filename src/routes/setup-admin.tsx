import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSetupState, setupAdminUser } from "@/lib/admin-setup.functions";

export const Route = createFileRoute("/setup-admin")({
  head: () => ({ meta: [{ title: "Setup admin — Science Tech 2026" }] }),
  component: SetupAdminPage,
});

function SetupAdminPage() {
  const navigate = useNavigate();
  const getState = useServerFn(getAdminSetupState);
  const setupAdmin = useServerFn(setupAdminUser);
  const [state, setState] = useState<Awaited<ReturnType<typeof getAdminSetupState>> | null>(null);
  const [setupToken, setSetupToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getState()
      .then((result) => {
        setState(result);
        setEmail(result.seedEmail);
      })
      .catch((error) => toast.error(error.message));
  }, [getState]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await setupAdmin({ data: { setupToken, email, password } });
      toast.success(result.message);
      navigate({ to: "/auth" });
    } catch (error: any) {
      toast.error(error.message || "Не удалось создать администратора");
    } finally {
      setLoading(false);
    }
  };

  const lockedForNonSeed = state?.hasAdmin && !state?.canRepairSeedAdmin;

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mx-auto mb-5 size-12 rounded-2xl bg-primary grid place-items-center text-primary-foreground">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="text-2xl font-bold text-center">Защищённый setup администратора</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Эта страница создаёт первого admin-пользователя или восстанавливает seed-admin по email проекта.
          Доступ защищён переменной <code>ADMIN_SETUP_SECRET</code>.
        </p>

        {state && (
          <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div>Admin-аккаунтов: <b className="text-foreground">{state.adminCount}</b></div>
            <div>Seed email: <b className="text-foreground">{state.seedEmail}</b></div>
            <div>Seed role: <b className="text-foreground">{state.seedHasAdminRole ? "admin выдан" : "нужно выдать"}</b></div>
          </div>
        )}

        {lockedForNonSeed ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Первый администратор уже существует.</p>
            <Button className="mt-4" onClick={() => navigate({ to: "/auth" })}>Перейти ко входу</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label>Setup token</Label>
              <Input required type="password" value={setupToken} onChange={(e) => setSetupToken(e.target.value)} />
            </div>
            <div>
              <Label>Email администратора</Label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Новый пароль</Label>
              <Input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading || !state?.setupSecretConfigured} className="w-full bg-primary text-primary-foreground border-0">
              {loading ? "Создаю…" : state?.hasAdmin ? "Восстановить seed-admin" : "Создать первого admin"}
            </Button>
            {!state?.setupSecretConfigured && (
              <p className="text-xs text-destructive">Сначала задайте секрет ADMIN_SETUP_SECRET в настройках проекта.</p>
            )}
          </form>
        )}

        <Link to="/" className="mt-5 block text-center text-xs text-muted-foreground hover:text-foreground">← На сайт</Link>
      </div>
    </div>
  );
}