import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, AlertTriangle, Camera, CameraOff, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/_authenticated/admin/checkin")({ component: Page });

type Result =
  | { kind: "ok" | "already"; name: string; code: string; org?: string | null; at?: string | null }
  | { kind: "invalid"; raw: string }
  | { kind: "error"; message: string };

function Page() {
  const [result, setResult] = useState<Result | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastRef = useRef<{ v: string; t: number }>({ v: "", t: 0 });


  const process = async (raw: string) => {
    let token = raw.trim();
    // If a JSON payload from our QR, extract token or id
    try {
      const parsed = JSON.parse(token);
      if (parsed && typeof parsed === "object") token = parsed.token || parsed.id || token;
    } catch {}
    if (!token) return;

    const { data, error } = await supabase.rpc("checkin_registration", { _token: token });
    if (error) {
      setResult({ kind: "error", message: error.message });
      return;
    }
    const payload = data as any;
    if (payload?.status === "invalid") {
      setResult({ kind: "invalid", raw: token });
      return;
    }
    const r = payload.registration ?? {};
    setResult({
      kind: payload.status === "ok" ? "ok" : "already",
      name: r.full_name,
      code: r.registration_code,
      org: r.organization,
      at: r.checked_in_at,
    });
  };

  // Open popup on every new result; vibrate for feedback on phones
  useEffect(() => {
    if (!result) return;
    setPopupOpen(true);
    try {
      const pattern = result.kind === "ok" ? [80] : result.kind === "already" ? [40, 60, 40] : [200];
      (navigator as any).vibrate?.(pattern);
    } catch {}
  }, [result]);


  const startScan = async () => {
    try {
      setResult(null);
      if (!window.isSecureContext) {
        setResult({ kind: "error", message: "Камера доступна только по HTTPS. Откройте опубликованный сайт (не в редакторе)." });
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setResult({ kind: "error", message: "Браузер не поддерживает доступ к камере." });
        return;
      }
      // Explicit permission prompt first — gives a clear error if denied/blocked
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        s.getTracks().forEach((t) => t.stop());
      } catch (permErr: any) {
        const name = permErr?.name || "";
        let msg = "Не удалось получить доступ к камере.";
        if (name === "NotAllowedError") msg = "Доступ к камере запрещён. Разрешите доступ в настройках браузера.";
        else if (name === "NotFoundError") msg = "Камера не найдена на этом устройстве.";
        else if (name === "NotReadableError") msg = "Камера занята другим приложением.";
        else if (window.self !== window.top) msg = "Камера заблокирована в iframe редактора. Откройте опубликованный сайт в новой вкладке.";
        setResult({ kind: "error", message: msg });
        return;
      }
      setScanning(true);
      // Wait for the target div to render (it's conditional on `scanning`? no — always mounted)
      await new Promise((r) => setTimeout(r, 50));
      const el = document.getElementById("qr-reader");
      if (!el) { setResult({ kind: "error", message: "qr-reader элемент не найден" }); setScanning(false); return; }
      el.innerHTML = "";
      const html5 = new Html5Qrcode("qr-reader");
      scannerRef.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decoded) => {
          const now = Date.now();
          if (decoded === lastRef.current.v && now - lastRef.current.t < 3000) return;
          lastRef.current = { v: decoded, t: now };
          process(decoded);
        },
        () => {},
      );
    } catch (e: any) {
      setScanning(false);
      setResult({ kind: "error", message: e?.message ?? "Camera error" });
    }
  };

  const stopScan = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch {}
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => () => { stopScan(); }, []);

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manual.trim()) {
      process(manual.trim());
      setManual("");
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ScanLine className="size-6"/> Check-in</h1>
      <p className="text-sm text-muted-foreground mt-1">Отсканируйте QR-код участника или введите Registration ID вручную.</p>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold flex items-center gap-2"><Camera className="size-4"/> Камера</div>
            {scanning ? (
              <Button size="sm" variant="outline" onClick={stopScan}><CameraOff className="size-4 mr-2"/>Стоп</Button>
            ) : (
              <Button size="sm" onClick={startScan}><Camera className="size-4 mr-2"/>Включить</Button>
            )}
          </div>
          <div id="qr-reader" className="rounded-lg overflow-hidden bg-black/5 min-h-[240px] grid place-items-center text-sm text-muted-foreground">
            {!scanning && "Камера выключена"}
          </div>

          <form onSubmit={submitManual} className="mt-4 flex gap-2">
            <Input placeholder="ST2026-XXXXXXXX-XXXX" value={manual} onChange={(e) => setManual(e.target.value)} />
            <Button type="submit">Отметить</Button>
          </form>
        </div>

        <div className="hidden md:block">
          <ResultView result={result} />
        </div>
      </div>

      {/* Mobile popup with scan result */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="md:hidden max-w-[92vw] p-4 gap-3">
          <DialogTitle className="sr-only">Результат сканирования</DialogTitle>
          <ResultView result={result} />
          <Button onClick={() => setPopupOpen(false)} className="w-full">Сканировать следующего</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}


function ResultView({ result }: { result: Result | null }) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground h-full grid place-items-center">
        Результат сканирования появится здесь
      </div>
    );
  }
  if (result.kind === "ok") return (
    <Card color="emerald" icon={<CheckCircle2 className="size-10"/>} title="Checked In ✓" subtitle="Участник успешно отмечен">
      <Row label="Имя" value={result.name} />
      <Row label="ID" value={result.code} mono />
      {result.org && <Row label="Организация" value={result.org} />}
    </Card>
  );
  if (result.kind === "already") return (
    <Card color="amber" icon={<AlertTriangle className="size-10"/>} title="Этот QR-код уже был использован" subtitle={result.at ? `Отмечен: ${new Date(result.at).toLocaleString()}` : undefined}>
      <Row label="Имя" value={result.name} />
      <Row label="ID" value={result.code} mono />
    </Card>
  );
  if (result.kind === "invalid") return (
    <Card color="red" icon={<XCircle className="size-10"/>} title="Недействительный QR-код" subtitle="Участник не найден в базе">
      <div className="text-xs font-mono text-muted-foreground break-all">{result.raw}</div>
    </Card>
  );
  return (
    <Card color="red" icon={<XCircle className="size-10"/>} title="Ошибка" subtitle={result.kind === "error" ? result.message : ""} />
  );
}

function Card({ color, icon, title, subtitle, children }: { color: "emerald"|"amber"|"red"; icon: React.ReactNode; title: string; subtitle?: string; children?: React.ReactNode }) {
  const map = {
    emerald: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700",
    amber: "border-amber-500/40 bg-amber-500/5 text-amber-700",
    red: "border-red-500/40 bg-red-500/5 text-red-700",
  } as const;
  return (
    <div className={`rounded-2xl border-2 p-6 ${map[color]}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-lg font-bold">{title}</div>
          {subtitle && <div className="text-sm opacity-80">{subtitle}</div>}
        </div>
      </div>
      {children && <div className="mt-4 space-y-1 text-foreground">{children}</div>}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-28 shrink-0">{label}:</span>
      <span className={mono ? "font-mono font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}
