import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Globe, Menu } from "lucide-react";
import logo from "@/assets/science-tech-logo-t.png.asset.json";
import { Button } from "@/components/ui/button";
import { useI18n, LANGS, type Lang } from "@/lib/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Header({ onRegister: _onRegister }: { onRegister?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const { tr, lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";
  const links = [
    { href: "#about", label: tr("nav_about") },
    { href: "#sections", label: tr("nav_sections") },
    { href: "#program", label: tr("nav_program") },
    { href: "#speakers", label: tr("nav_speakers") },
    { href: "#articles", label: tr("nav_articles") },
    { href: "#partners", label: tr("nav_partners") },
    { href: "#contacts", label: tr("nav_contacts") },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo.url} alt="Science Tech 2026" className="h-9 md:h-10 w-auto object-contain" />
        </Link>
        <nav className="hidden lg:flex items-center gap-6 ml-6 text-sm">
          {links.map((l) => (
            <a key={l.href} href={onHome ? l.href : `/${l.href}`} className="text-muted-foreground hover:text-foreground transition">{l.label}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden" aria-label={tr("menu")}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">{tr("nav_title")}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-6 -mt-2">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={onHome ? l.href : `/${l.href}`}
                    onClick={() => setOpen(false)}
                    className="py-2.5 text-base text-muted-foreground hover:text-foreground border-b border-border/40 transition"
                  >
                    {l.label}
                  </a>
                ))}
                <Button asChild variant="ghost" className="justify-start mt-3" onClick={() => setOpen(false)}>
                  <Link to="/certificate">{tr("cert_nav")}</Link>
                </Button>
                <Button asChild className="bg-primary text-primary-foreground hover:opacity-90 border-0 mt-1" onClick={() => setOpen(false)}>
                  <Link to="/register">{tr("register")}</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
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
          <Button asChild className="hidden md:inline-flex bg-primary text-primary-foreground hover:opacity-90 border-0">
            <Link to="/register">{tr("register")}</Link>
          </Button>

        </div>
      </div>
    </header>
  );
}
