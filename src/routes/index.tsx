import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Countdown } from "@/components/site/Countdown";
import { RegistrationDialog } from "@/components/site/RegistrationDialog";
import { settingsQuery, sectionsQuery, speakersQuery, programQuery, partnersQuery } from "@/lib/queries";
import { useI18n, pickL, pickLArray } from "@/lib/i18n";
import logoAsset from "@/assets/science-tech-logo.png.asset.json";

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

const roman = (n: number) => {
  const map: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let r = "";
  for (const [v, s] of map) while (n >= v) { r += s; n -= v; }
  return r;
};

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
    <div className="min-h-screen flex flex-col bg-background">
      <Header onRegister={() => setRegOpen(true)} />

      {/* HERO — editorial cover */}
      <section className="relative bg-hero border-b border-border">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 lg:pt-28 lg:pb-24 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 animate-fade-up">
            <div className="flex items-center gap-3 eyebrow">
              <span>{pickL(hero.badge, lang) || "International Conference"}</span>
              <span className="h-px flex-1 bg-border"></span>
              <span>MMXXVI</span>
            </div>

            <h1 className="mt-8 font-serif-display text-5xl md:text-7xl leading-[1.02] text-foreground">
              {pickL(hero.title, lang)}
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground font-serif-display italic">
              {pickL(hero.subtitle, lang)}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border border-y border-border">
              <div className="flex items-center gap-3 py-4 sm:pr-8 sm:pl-0 pl-0">
                <Calendar className="size-4 text-accent shrink-0" />
                <div>
                  <div className="eyebrow text-[10px]">{tr("event_date_label")}</div>
                  <div className="font-serif-display text-lg text-foreground mt-0.5">{pickL(hero.date_label, lang)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 py-4 sm:px-8">
                <MapPin className="size-4 text-accent shrink-0" />
                <div>
                  <div className="eyebrow text-[10px]">{tr("location_label")}</div>
                  <div className="font-serif-display text-lg text-foreground mt-0.5">{pickL(hero.location, lang)}</div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                <Link to="/register">{tr("register_long")}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-none border border-border hover:bg-secondary px-8">
                <a href="#program">{tr("program_title") || "Программа"}</a>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 animate-fade-up" style={{ animationDelay: "150ms" }}>
            <figure className="relative">
              <div className="aspect-[4/5] w-full bg-secondary border border-border grid place-items-center overflow-hidden">
                <img
                  src={logoAsset.url}
                  alt="Science Tech 2026"
                  className="w-3/4 h-3/4 object-contain"
                />
              </div>
              <figcaption className="mt-3 eyebrow text-[10px] flex items-center gap-3">
                <span>Plate I</span>
                <span className="h-px flex-1 bg-border"></span>
                <span>Emblem</span>
              </figcaption>
            </figure>

            {hero.event_date && (
              <div className="mt-8">
                <Countdown target={hero.event_date} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 border-b border-border">
        <div className="mx-auto max-w-4xl px-6">
          <SectionHeading numeral="I" eyebrow={tr("nav_about")} title={pickL(about.title, lang)} />
          <div className="mt-10 space-y-5 text-[17px] leading-[1.8] text-foreground/85 font-serif-display">
            {pickLArray(about.paragraphs, lang).map((p, i) => (
              <p key={i} className={i === 0 ? "first-letter:font-serif-display first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:mt-1 first-letter:text-primary" : ""}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* SECTIONS — index list */}
      <section id="sections" className="py-24 border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading numeral="II" eyebrow={tr("sections_title")} title={tr("sections_title")} sub={tr("sections_subtitle")} />
          <ol className="mt-12 divide-y divide-border border-y border-border">
            {sections.map((s, i) => (
              <li key={s.id} className="grid grid-cols-[3rem_1fr] md:grid-cols-[4rem_10rem_1fr] gap-6 py-6 group hover:bg-background/60 transition-colors px-2">
                <div className="eyebrow text-[11px] pt-1">{String(i + 1).padStart(2, "0")}</div>
                <div className="hidden md:block eyebrow text-[11px] text-accent pt-1">Track {roman(i + 1)}</div>
                <div>
                  <h3 className="font-serif-display text-2xl text-foreground">{pickL(s.title, lang)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">{pickL(s.description, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PROGRAM */}
      <section id="program" className="py-24 border-b border-border">
        <div className="mx-auto max-w-4xl px-6">
          <SectionHeading numeral="III" eyebrow="Programme" title={tr("program_title")} />
          <div className="mt-12 divide-y divide-border border-y border-border">
            {program.map((p) => (
              <div key={p.id} className="grid grid-cols-[6rem_1fr] md:grid-cols-[9rem_1fr] gap-6 py-5">
                <div className="font-mono text-xs text-accent tracking-wider pt-1">{p.time_label}</div>
                <div>
                  <div className="font-serif-display text-xl text-foreground">{pickL(p.title, lang)}</div>
                  {pickL(p.description, lang) && <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{pickL(p.description, lang)}</div>}
                  {p.speaker && <div className="text-xs eyebrow mt-3">— {p.speaker}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPEAKERS */}
      <section id="speakers" className="py-24 border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading numeral="IV" eyebrow="Faculty" title={tr("speakers_title")} />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {speakers.map((s, i) => {
              const localName = pickL(s.name, lang) || "";
              return (
                <article key={s.id} className="group">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted border border-border">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={localName} className="absolute inset-0 size-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-primary text-primary-foreground font-serif-display text-4xl">
                        {localName.split(" ").map(p => p[0]).slice(0, 2).join("")}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 eyebrow text-[10px] flex items-center gap-2">
                    <span>№ {String(i + 1).padStart(2, "0")}</span>
                    <span className="h-px flex-1 bg-border"></span>
                  </div>
                  <h3 className="mt-2 font-serif-display text-xl text-foreground leading-tight">{localName}</h3>
                  <div className="text-sm text-accent mt-1 italic font-serif-display">{pickL(s.title, lang)}</div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{pickL(s.bio, lang)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section id="partners" className="py-24 border-b border-border">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading numeral="V" eyebrow="Institutions" title={tr("partners_title")} />
        </div>
        <div className="mt-14 group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] items-center">
            {[...partners, ...partners].map((p, i) => (
              <a
                key={`${p.id}-${i}`}
                href={p.url || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label={p.name}
                className="shrink-0 mx-[40px] md:mx-[56px] grid place-items-center opacity-70 hover:opacity-100 transition"
              >
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.name} className="h-10 md:h-14 w-auto object-contain grayscale" loading="lazy" />
                ) : (
                  <span className="font-serif-display text-base text-muted-foreground">{p.name}</span>
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

function SectionHeading({ numeral, eyebrow, title, sub }: { numeral: string; eyebrow?: string; title: string; sub?: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-4">
        <span className="font-serif-display italic text-accent text-2xl">{numeral}.</span>
        <span className="eyebrow">{eyebrow}</span>
        <span className="h-px flex-1 bg-border"></span>
      </div>
      <h2 className="mt-4 font-serif-display text-4xl md:text-5xl text-foreground max-w-3xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">{sub}</p>}
    </div>
  );
}
