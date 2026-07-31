import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import QRCode from "qrcode";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Download, ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n, pickL } from "@/lib/i18n";
import { settingsQuery } from "@/lib/queries";
import { normalizeFields } from "@/lib/register-fields";
import { toast } from "sonner";
import { sendRegistrationEmail } from "@/lib/registration-email.functions";
import { createRegistration } from "@/lib/registration.functions";

import logo from "@/assets/science-tech-logo-t.png.asset.json";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Регистрация — Science Tech 2026" },
      { name: "description", content: "Зарегистрируйтесь на международную научную конференцию Science Tech 2026 в Бишкеке." },
      { property: "og:title", content: "Регистрация — Science Tech 2026" },
      { property: "og:description", content: "Международная научная конференция, 18 сентября 2026, Бишкек." },
    ],
  }),
  component: RegisterPage,
});

interface SuccessData {
  code: string;
  qrDataUrl: string;
  fullName: string;
  email: string;
}

function RegisterPage() {
  const { tr, lang } = useI18n();
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const rp = settings.register_page ?? {};
  const t = (key: string, fallback: string) => pickL(rp[key], lang) || fallback;
  const fields = normalizeFields(settings.register_fields).filter((f) => f.enabled);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const get = (k: string) => values[k] ?? "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error(tr("reg_consent"));
      return;
    }
    setLoading(true);
    try {
      const extra: Record<string, string> = {};
      for (const f of fields) {
        if (!f.builtin) {
          const v = get(f.key).trim();
          if (v) extra[f.key] = v.slice(0, 1000);
        }
      }

      const data = await createRegistration({
        data: {
          full_name: get("full_name").trim(),
          email: get("email").trim().toLowerCase(),
          phone: get("phone").trim() || null,
          organization: get("organization").trim() || null,
          position: get("position").trim() || null,
          country: get("country").trim() || null,
          extra,
        },
      });

      const qrPayload = JSON.stringify({
        id: data.registration_code,
        token: data.qr_token,
        event: "Science Tech 2026",
      });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 480,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });

      const code = data.registration_code ?? "";
      // Fire-and-forget email; ignore errors on the client
      sendRegistrationEmail({
        data: {
          registration_id: data.id,
          registration_code: code,
          full_name: data.full_name,
          email: data.email,
          qr_data_url: qrDataUrl,
        },
      }).catch(() => {});

      setSuccess({
        code,
        qrDataUrl,
        fullName: data.full_name,
        email: data.email,
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onRegister={() => {}} />
      <main className="flex-1 bg-background py-10 md:py-16">
        <div className="mx-auto max-w-2xl px-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="size-4" /> {tr("view_site")}
          </Link>

          {success ? (
            <SuccessCard data={success} texts={{ title: t("success_title", tr("reg_success_title")), msg: t("success_msg", tr("reg_success_msg")) }} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo.url} alt="" className="h-10 w-auto" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{t("title", tr("reg_dialog_title"))}</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                <Calendar className="inline size-4 mr-1" /> {t("subtitle", "18.09.2026 · Бишкек")}
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4">
                {fields.map((f) => {
                  const label = `${pickL(f.label, lang) || f.key}${f.required ? " *" : ""}`;
                  return (
                    <Field key={f.key} label={label}>
                      {f.type === "textarea" ? (
                        <Textarea
                          required={f.required}
                          maxLength={1000}
                          rows={3}
                          value={get(f.key)}
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      ) : f.type === "select" ? (
                        <select
                          required={f.required}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={get(f.key)}
                          onChange={(e) => set(f.key, e.target.value)}
                        >
                          <option value="">—</option>
                          {(f.options ?? []).map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          required={f.required}
                          type={f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
                          maxLength={200}
                          value={get(f.key)}
                          onChange={(e) => set(f.key, e.target.value)}
                        />
                      )}
                    </Field>
                  );
                })}

                <label className="flex items-start gap-3 pt-2 cursor-pointer">
                  <Checkbox
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">{t("consent", tr("reg_consent"))}</span>
                </label>

                <Button
                  type="submit"
                  disabled={loading || !consent}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground border-0 hover:opacity-90"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : t("submit", tr("reg_submit"))}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer contacts={settings.contacts ?? {}} />
    </div>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function SuccessCard({ data, texts }: { data: SuccessData; texts: { title: string; msg: string } }) {
  const { tr } = useI18n();
  const download = () => {
    const a = document.createElement("a");
    a.href = data.qrDataUrl;
    a.download = `ScienceTech2026-${data.code}.png`;
    a.click();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-xl text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
        <CheckCircle2 className="size-9" />
      </div>
      <h1 className="mt-5 text-2xl md:text-3xl font-bold">{texts.title}</h1>
      <p className="mt-3 text-muted-foreground max-w-lg mx-auto">{texts.msg}</p>

      <div className="mt-8 inline-block rounded-2xl bg-white p-4 shadow-lg ring-1 ring-border">
        <img src={data.qrDataUrl} alt="QR" className="size-56 md:size-64" />
      </div>

      <div className="mt-6 text-sm">
        <div className="text-muted-foreground">{tr("reg_your_id")}</div>
        <div className="mt-1 font-mono text-base font-semibold tracking-wider">{data.code}</div>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        {data.fullName} · {data.email}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={download} className="gap-2">
          <Download className="size-4" /> {tr("reg_download_qr")}
        </Button>
        <Button asChild variant="outline">
          <Link to="/">{tr("view_site")}</Link>
        </Button>
      </div>
    </div>
  );
}
