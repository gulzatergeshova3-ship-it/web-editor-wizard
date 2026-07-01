import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Calendar, MapPin, Atom, Brain, Leaf, Heart, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Countdown } from "@/components/site/Countdown";
import { RegistrationDialog } from "@/components/site/RegistrationDialog";
import { settingsQuery, sectionsQuery, speakersQuery, programQuery, partnersQuery } from "@/lib/queries";
import { useI18n, pickL, pickLArray } from "@/lib/i18n";
import atom3dAsset from "@/assets/atom-3d.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Science Tech 2026 — Международная научная конференция" },
      { name: "description", content: "Ведущая площадка для обмена научными достижениями и технологическими инновациями. 18 сентября 2026, Бишкек." },
      { property: "og:title", content: "Science Tech 2026 — Международная научная конференция" },
      { property: "og:description", content: "18 сентября 2026, Бишкек. Идеи. Инновации. Будущее." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(settingsQuery);
    context.queryClient.ensureQueryData(sectionsQuery);
    context.queryClient.ensureQueryData(speakersQuery);
    context.queryClient.ensureQueryData(programQuery);
    context.queryClient.ensureQueryData(partnersQuery);
  },
  component: LandingPage,
  errorComponent: ({ error }) => <div className="p-8 text-center">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

const iconMap: Record<string, any> = { brain: Brain, leaf: Leaf, heart: Heart, building: Building2, atom: Atom };

function LandingPage() {
  const { lang, tr } = useI18n();
  const [regOpen, setRegOpen] = useState(false);
  const [{ data: settings }, { data: sections }, { data: speakers }, { data: program }, { data: partners }] = useSuspenseQueries({
    queries: [settingsQuery, sectionsQuery, speakersQuery, programQuery, partnersQuery],
  });
  const hero = settings.hero ?? {};
  const about = settings.about ?? {};
  const contacts = settings.contacts ?? {};

  return (
    <div className="min-h-screen flex flex-col">
      <Header onRegister={() => setRegOpen(true)} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 opacity-50 pointer-events-none [background-image:linear-gradient(oklch(0.9_0.02_240/.4)_1px,transparent_1px),linear-gradient(90deg,oklch(0.9_0.02_240/.4)_1px,transparent_1px)] [background-size:48px_48px]"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Atom className="size-3.5" /> {pickL(hero.badge, lang)}
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-tight">
              <span className="text-gradient-brand">{pickL(hero.title, lang)}</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{pickL(hero.subtitle, lang)}</p>

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 flex gap-3">
                <Calendar className="size-5 text-primary mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{tr("event_date_label")}</div>
                  <div className="font-semibold text-sm">{pickL(hero.date_label, lang)}</div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 flex gap-3">
                <MapPin className="size-5 text-primary mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{tr("location_label")}</div>
                  <div className="font-semibold text-sm">{pickL(hero.location, lang)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-white border-0 shadow-brand">
                <Link to="/register">{tr("register_long")}</Link>
              </Button>

            </div>
          </div>

          <div className="relative">
            <div className="aspect-square w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto relative">
              {/* Decorative squares (poster style) — sized relatively so they scale on mobile */}
              <div className="absolute top-0 right-[8%] w-[28%] aspect-square bg-cyan-300/50 rounded-sm"></div>
              <div className="absolute top-[16%] right-0 w-[18%] aspect-square bg-cyan-200/60 rounded-sm"></div>
              <div className="absolute top-[4%] right-[42%] w-[12%] aspect-square bg-cyan-400/30 rounded-sm"></div>
              <div className="absolute bottom-[10%] left-[2%] w-[22%] aspect-square bg-cyan-300/40 rounded-sm"></div>
              <div className="absolute bottom-0 left-[28%] w-[14%] aspect-square bg-cyan-200/50 rounded-sm"></div>
              <div className="absolute top-1/2 left-0 w-[14%] aspect-square bg-cyan-300/30 rounded-sm"></div>
              <div className="absolute bottom-[24%] right-[4%] w-[11%] aspect-square bg-cyan-200/40 rounded-sm"></div>

              {/* Spinning 3D atom — 80% width so rotation stays inside the box on every viewport */}
              <div className="absolute inset-0 grid place-items-center overflow-hidden">
                <img
                  src={atom3dAsset.url}
                  alt="Science Tech Atom"
                  className="w-[80%] h-[80%] object-contain drop-shadow-2xl relative z-10 animate-[spin_40s_linear_infinite] will-change-transform"
                  style={{ transformOrigin: "50% 50%", backfaceVisibility: "hidden" }}
                />
              </div>
            </div>


            {hero.event_date && (
              <div className="mt-6 max-w-md mx-auto">
                <Countdown target={hero.event_date} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 bg-background">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">{pickL(about.title, lang)}</h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-gradient-brand rounded-full"></div>
          <div className="mt-8 space-y-4 text-muted-foreground text-left md:text-center">
            {pickLArray(about.paragraphs, lang).map((p, i) => <p key={i} className="leading-relaxed">{p}</p>)}
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <section id="sections" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{tr("sections_title")}</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{tr("sections_subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {sections.map((s) => {
              const Icon = iconMap[s.icon || "atom"] ?? Atom;
              return (
                <div key={s.id} className="group rounded-2xl border border-border bg-card p-6 hover:shadow-brand transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-12 rounded-xl bg-gradient-brand text-white grid place-items-center">
                      <Icon className="size-6" />
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/30">{s.number}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{pickL(s.title, lang)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{pickL(s.description, lang)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section id="program" className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{tr("program_title")}</h2>
            <div className="mx-auto mt-3 h-1 w-16 bg-gradient-brand rounded-full"></div>
          </div>
          <div className="space-y-3">
            {program.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5 flex gap-4 hover:shadow-brand transition">
                <div className="shrink-0 w-32 font-mono text-sm text-primary font-semibold pt-0.5">{p.time_label}</div>
                <div>
                  <div className="font-semibold">{pickL(p.title, lang)}</div>
                  {pickL(p.description, lang) && <div className="text-sm text-muted-foreground mt-1">{pickL(p.description, lang)}</div>}
                  {p.speaker && <div className="text-xs text-primary mt-2">→ {p.speaker}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPEAKERS */}
      <section id="speakers" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{tr("speakers_title")}</h2>
            <div className="mx-auto mt-3 h-1 w-16 bg-gradient-brand rounded-full"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {speakers.map((s, i) => (
              <div key={s.id} className="group">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted">
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={s.name} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-brand text-white text-4xl font-bold">
                      {s.name.split(" ").map(p => p[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 text-[11px] font-mono tracking-[0.2em] text-white uppercase drop-shadow-md">
                    <span>SPK · {String(i + 1).padStart(2, "0")}</span>
                  </div>
                </div>
                <div className="mt-4 font-semibold text-base">{s.name}</div>
                <div className="text-sm text-primary mt-1">{pickL(s.title, lang)}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{pickL(s.bio, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section id="partners" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{tr("partners_title")}</h2>
            <div className="mx-auto mt-3 h-1 w-16 bg-gradient-brand rounded-full"></div>
          </div>
        </div>
        <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
            {[...partners, ...partners].map((p, i) => (
              <a
                key={`${p.id}-${i}`}
                href={p.url || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label={p.name}
                className="shrink-0 mx-[40px] md:mx-[50px] grid place-items-center"
              >
                {p.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    className="h-10 md:h-14 w-auto object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="font-semibold text-sm text-muted-foreground">{p.name}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>


      <Footer contacts={contacts} footer={settings.footer} />
      <RegistrationDialog open={regOpen} onOpenChange={setRegOpen} />
    </div>
  );
}
