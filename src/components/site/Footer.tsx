import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Linkedin, Instagram, Send, Facebook, Youtube, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const socialIcons: Record<string, any> = {
  linkedin: Linkedin,
  instagram: Instagram,
  telegram: Send,
  facebook: Facebook,
  youtube: Youtube,
};

export function Footer({ contacts, footer }: { contacts?: any; footer?: any }) {
  const { lang, tr, L } = useI18n();
  const f = footer ?? {};
  const main = f.main ?? {};
  const c = { ...(contacts ?? {}), ...(f.contacts ?? {}) };
  const quickLinks = (f.quick_links ?? []).filter((l: any) => l?.visible !== false).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const organizers = (f.organizers ?? []).slice().sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const social = f.social ?? {};
  const bottom = f.bottom ?? {};

  return (
    <footer id="contacts" className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Main */}
        <div>
          <div className="text-lg font-bold">{L(main.name) || "SCIENCE TECH 2026"}</div>
          {L(main.subtitle) && (
            <div className="mt-1 text-sm text-muted-foreground">{L(main.subtitle)}</div>
          )}
          {L(main.tagline) && (
            <p className="mt-3 text-sm">{L(main.tagline)}</p>
          )}
          {L(main.event_date) && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" /> {L(main.event_date)}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="text-sm space-y-2">
          <div className="font-semibold">{tr("contacts_title")}</div>
          {c.email && (
            <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:text-foreground text-muted-foreground">
              <Mail className="size-4" /> {c.email}
            </a>
          )}
          {c.phone && (
            <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:text-foreground text-muted-foreground">
              <Phone className="size-4" /> {c.phone}
            </a>
          )}
          {L(c.address) && (
            <a href={c.maps_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-foreground text-muted-foreground">
              <MapPin className="size-4 mt-0.5" /> <span>{L(c.address)}</span>
            </a>
          )}
        </div>

        {/* Quick links */}
        {quickLinks.length > 0 && (
          <div className="text-sm">
            <div className="font-semibold mb-2">{tr("quick_links")}</div>
            <ul className="space-y-1.5">
              {quickLinks.map((l: any) => (
                <li key={l.id}>
                  <a href={l.url} className="text-muted-foreground hover:text-foreground">
                    {L(l.label) || l.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Organizers */}
        {organizers.length > 0 && (
          <div className="text-sm">
            <div className="font-semibold mb-3">{tr("organizers") || "Организаторы"}</div>
            <div className="grid grid-cols-2 gap-3">
              {organizers.map((o: any) => (
                <div key={o.id} className="flex flex-col items-center gap-1">
                  {o.logo_url && (
                    <img src={o.logo_url} alt={o.name} className="h-12 object-contain" />
                  )}
                  {o.name && <div className="text-[11px] text-muted-foreground text-center">{o.name}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Social + admin */}
      <div className="mx-auto max-w-7xl px-4 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Object.entries(social).map(([key, url]) => {
            const Icon = socialIcons[key];
            if (!Icon || !url) return null;
            return (
              <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                 className="rounded-full p-2 border border-border hover:bg-accent transition"
                 aria-label={key}>
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>
        
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground space-y-1">
        {bottom.copyright && <div>{bottom.copyright}</div>}
        {bottom.made_by && <div>{bottom.made_by}</div>}
        {bottom.extra && <div>{bottom.extra}</div>}
      </div>
    </footer>
  );
}
