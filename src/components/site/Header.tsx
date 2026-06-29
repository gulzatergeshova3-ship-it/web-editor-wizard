import { Link } from "@tanstack/react-router";
import { Atom, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header({ onRegister }: { onRegister: () => void }) {
  const { tr, lang, setLang } = useI18n();
  const links = [
    { href: "#about", label: tr("nav_about") },
    { href: "#sections", label: tr("nav_sections") },
    { href: "#program", label: tr("nav_program") },
    { href: "#speakers", label: tr("nav_speakers") },
    { href: "#partners", label: tr("nav_partners") },
    { href: "#contacts", label: tr("nav_contacts") },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-gradient-brand grid place-items-center text-white">
            <Atom className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide">SCIENCE TECH</div>
            <div className="text-[10px] text-muted-foreground">2026</div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 ml-6 text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground transition">{l.label}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="size-4" /> {lang.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGS.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code as Lang)}>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onRegister} className="bg-gradient-brand text-white hover:opacity-90 border-0">
            {tr("register")}
          </Button>
        </div>
      </div>
    </header>
  );
}
