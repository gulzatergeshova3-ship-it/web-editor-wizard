import { Link } from "@tanstack/react-router";
import { useI18n, pickL } from "@/lib/i18n";

export function Footer({ contacts }: { contacts: any }) {
  const { lang, tr } = useI18n();
  return (
    <footer id="contacts" className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="text-lg font-bold">SCIENCE TECH 2026</div>
          <p className="mt-2 text-sm text-muted-foreground">{tr("contacts_title")}</p>
        </div>
        <div className="text-sm space-y-2">
          <div className="font-semibold">{tr("contacts_title")}</div>
          <div>{contacts?.email}</div>
          <div>{contacts?.phone}</div>
          <div className="text-muted-foreground">{pickL(contacts?.address, lang)}</div>
        </div>
        <div className="text-sm">
          <Link to="/auth" className="text-muted-foreground hover:text-foreground">{tr("admin")}</Link>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 Science Tech Conference
      </div>
    </footer>
  );
}
