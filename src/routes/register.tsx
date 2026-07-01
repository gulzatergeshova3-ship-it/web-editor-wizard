import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import QRCode from "qrcode";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Download, ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { settingsQuery } from "@/lib/queries";
import { toast } from "sonner";
import { sendRegistrationEmail } from "@/lib/registration-email.functions";

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
  const { tr } = useI18n();
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    position: "",
    country: "",
    consent: false,
  });

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      toast.error(tr("reg_consent"));
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("registrations")
      .insert({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        organization: form.organization.trim() || null,
        position: form.position.trim() || null,
        country: form.country.trim() || null,
      })
      .select("id, registration_code, qr_token, full_name, email")
      .single();

    if (error || !data) {
      setLoading(false);
      toast.error(error?.message ?? "Error");
      return;
    }

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
    setLoading(false);
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Header onRegister={() => {}} />
      <main className="flex-1 bg-gradient-to-b from-background to-primary/5 py-10 md:py-16">
        <div className="mx-auto max-w-2xl px-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="size-4" /> {tr("view_site")}
          </Link>

          {success ? (
            <SuccessCard data={success} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo.url} alt="" className="h-10 w-auto" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{tr("reg_dialog_title")}</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                <Calendar className="inline size-4 mr-1" /> 18.09.2026 · <MapPin className="inline size-4 mr-1" /> Бишкек
              </p>

              <form onSubmit={submit} className="mt-8 space-y-4">
                <Field label={`${tr("reg_full_name")} *`}>
                  <Input required maxLength={120} value={form.full_name} onChange={upd("full_name")} />
                </Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label={`${tr("reg_email")} *`}>
                    <Input required type="email" maxLength={200} value={form.email} onChange={upd("email")} />
                  </Field>
                  <Field label={`${tr("reg_phone")} *`}>
                    <Input required type="tel" maxLength={40} value={form.phone} onChange={upd("phone")} />
                  </Field>
                </div>
                <Field label={`${tr("reg_org")} *`}>
                  <Input required maxLength={200} value={form.organization} onChange={upd("organization")} />
                </Field>
                <Field label={`${tr("reg_position")} *`}>
                  <Input required maxLength={150} value={form.position} onChange={upd("position")} />
                </Field>
                <Field label={`${tr("reg_country")} *`}>
                  <Input required maxLength={100} value={form.country} onChange={upd("country")} />
                </Field>

                <label className="flex items-start gap-3 pt-2 cursor-pointer">
                  <Checkbox
                    checked={form.consent}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, consent: v === true }))}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">{tr("reg_consent")}</span>
                </label>

                <Button
                  type="submit"
                  disabled={loading || !form.consent}
                  size="lg"
                  className="w-full bg-gradient-brand text-white border-0 hover:opacity-90"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : tr("reg_submit")}
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

function SuccessCard({ data }: { data: SuccessData }) {
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
      <h1 className="mt-5 text-2xl md:text-3xl font-bold">{tr("reg_success_title")}</h1>
      <p className="mt-3 text-muted-foreground max-w-lg mx-auto">{tr("reg_success_msg")}</p>

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
