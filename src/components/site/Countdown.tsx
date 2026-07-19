import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function Countdown({ target }: { target: string }) {
  const { tr } = useI18n();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = new Date(target).getTime();
  const diff = now === null ? 0 : Math.max(0, t - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const items = [
    { v: days, l: tr("days") },
    { v: hours, l: tr("hours") },
    { v: minutes, l: tr("minutes") },
    { v: seconds, l: tr("seconds") },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-6 shadow-lg">
      <p className="text-center text-sm font-medium text-muted-foreground mb-4">{tr("countdown_title")}</p>
      <div className="grid grid-cols-4 gap-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl bg-muted/60 px-2 py-4 text-center">
            <div className="text-3xl md:text-4xl font-bold tabular-nums text-foreground">{String(it.v).padStart(2, "0")}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{it.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
