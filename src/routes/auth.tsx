import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Кабинет — Science Tech 2026" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { tr } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-brand">
        <Link to="/" className="flex items-center gap-2 mb-6 justify-center">
          <div className="size-10 rounded-xl bg-gradient-brand grid place-items-center text-white"><Atom className="size-5"/></div>
          <div className="font-bold">SCIENCE TECH 2026</div>
        </Link>
        <h1 className="text-2xl font-bold text-center">{mode === "in" ? tr("sign_in") : tr("sign_up")}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label>Email</Label><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}/></div>
          <div><Label>{tr("password")}</Label><Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}/></div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-white border-0">
            {loading ? "..." : (mode === "in" ? tr("sign_in") : tr("sign_up"))}
          </Button>
        </form>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center">
          {mode === "in" ? tr("sign_up") : tr("sign_in")}
        </button>
        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground">← {tr("view_site")}</Link>
      </div>
    </div>
  );
}
