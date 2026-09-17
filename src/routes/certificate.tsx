import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Loader2, Search } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { settingsQuery } from "@/lib/queries";
import { findCertificate } from "@/lib/certificate.functions";
import { toast } from "sonner";
import template from "@/assets/certificate-template.jpg.asset.json";

export const Route = createFileRoute("/certificate")({
  head: () => ({
    meta: [
      { title: "Сертификат участника — Science Tech 2026" },
      { name: "description", content: "Получите электронный сертификат участника конференции Science Tech 2026 по вашему ФИО." },
      { property: "og:title", content: "Сертификат участника — Science Tech 2026" },
      { property: "og:description", content: "Электронный сертификат участника Science Tech 2026, Бишкек, 18 сентября 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CertificatePage,
});

const W = 1536;
const H = 1024;

async function renderCertificate(name: string): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = template.url;
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, W, H);

  // Name box in the template (approximate, from design)
  const boxLeft = 100;
  const boxRight = 866;
  const boxTop = 450;
  const boxBottom = 546;
  const centerX = (boxLeft + boxRight) / 2;
  const centerY = (boxTop + boxBottom) / 2;
  const maxWidth = boxRight - boxLeft - 60;

  let size = 46;
  const text = name.trim().toUpperCase();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#0b2545";
  do {
    ctx.font = `600 ${size}px Inter, Arial, sans-serif`;
    size -= 2;
  } while (ctx.measureText(text).width > maxWidth && size > 18);

  ctx.fillText(text, centerX, centerY, maxWidth);

  return canvas.toDataURL("image/jpeg", 0.95);
}

function CertificatePage() {
  const { tr } = useI18n();
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; code: string | null; url: string } | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await findCertificate({ data: { query: query.trim() } });
      if (res.status === "not_found") {
        toast.error(tr("cert_not_found"));
        return;
      }
      if (res.status === "not_checked_in") {
        toast.error(tr("cert_not_checked_in"));
        return;
      }
      const url = await renderCertificate(res.full_name);
      setResult({ name: res.full_name, code: res.registration_code, url });
    } catch (err: any) {
      toast.error(err?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = linkRef.current!;
    a.href = result.url;
    a.download = `ScienceTech2026-Certificate-${result.code ?? result.name}.jpg`;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-10 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="size-4" /> {tr("view_site")}
          </Link>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-xl">
            <h1 className="text-2xl md:text-3xl font-bold">{tr("cert_title")}</h1>
            <p className="text-muted-foreground mt-3 text-sm md:text-base">{tr("cert_subtitle")}</p>

            <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <Label className="mb-1.5 block">{tr("cert_input_label")}</Label>
                <Input
                  required
                  minLength={2}
                  maxLength={200}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tr("reg_full_name")}
                />
              </div>
              <Button type="submit" disabled={loading} className="gap-2 bg-primary text-primary-foreground border-0 hover:opacity-90">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                {tr("cert_get")}
              </Button>
            </form>
          </div>

          {result && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-4 md:p-6 shadow-xl">
              <img src={result.url} alt={tr("cert_title")} className="w-full rounded-lg" />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {result.name}
                  {result.code ? ` · ${result.code}` : ""}
                </div>
                <Button onClick={download} className="gap-2">
                  <Download className="size-4" /> {tr("cert_download")}
                </Button>
              </div>
              <a ref={linkRef} className="hidden" />
            </div>
          )}
        </div>
      </main>
      <Footer contacts={settings.contacts ?? {}} />
    </div>
  );
}
