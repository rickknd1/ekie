"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Zap, Bell } from "lucide-react";
import { VILLES, getVille, quartiersDeVille } from "@/lib/data";
import { getSelectedVille, setSelectedVille } from "@/lib/follows";
import CitySelect from "@/components/CitySelect";
import SignalModal from "@/components/SignalModal";
import QuartierRow, { sortQuartiers } from "@/components/QuartierRow";
import { useRouter } from "next/navigation";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [villeId, setVilleId] = useState("yaounde");
  const [signalOpen, setSignalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setVilleId(getSelectedVille());
  }, []);

  const ville = getVille(villeId) || VILLES[0];
  const quartiers = useMemo(() => sortQuartiers(quartiersDeVille(villeId)), [villeId]);
  const nbCoupe = quartiers.filter((q) => q.etat === "coupe").length;

  function changeVille(id: string) {
    setVilleId(id);
    setSelectedVille(id);
  }

  function onSignalDone(type: "coupure" | "retablissement") {
    setSignalOpen(false);
    setToast(
      type === "coupure" ? "Coupure signalée. Merci 🙏" : "Rétablissement signalé. Merci 🙏"
    );
    setTimeout(() => setToast(null), 2600);
  }

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <MapView ville={ville} quartiers={quartiers} onSelect={(id) => router.push(`/quartier/${id}`)} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[610] h-32 bg-gradient-to-b from-[var(--bg)] to-transparent" />

      <header className="absolute inset-x-0 top-0 z-[620] flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-[var(--line-strong)] bg-[var(--surface)]">
            <Zap size={18} className="text-[var(--cyan)]" />
          </div>
          <CitySelect villeId={villeId} onChange={changeVille} />
        </div>
        <Link
          href="/notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)]"
        >
          <Bell size={18} className="text-[var(--cyan)]" />
        </Link>
      </header>

      {/* DESKTOP : panneau latéral */}
      <aside className="absolute bottom-5 left-5 top-24 z-[615] hidden w-[360px] flex-col overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--surface)] md:flex">
        <PanelHeader nbCoupe={nbCoupe} />
        <div className="flex-1 overflow-y-auto no-sb px-5">
          <List quartiers={quartiers} />
        </div>
        <div className="p-4">
          <button
            onClick={() => setSignalOpen(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--cyan)] text-[15px] font-bold text-[var(--cyan-ink)] transition active:scale-[.99]"
          >
            <Zap size={18} /> Signaler
          </button>
        </div>
      </aside>

      {/* MOBILE : bottom sheet */}
      <div className="absolute inset-x-0 bottom-0 z-[615] h-[42vh] rounded-t-[20px] border-t border-[var(--line)] bg-[var(--surface)] px-5 pt-2.5 md:hidden">
        <div className="mx-auto mb-1 h-1 w-9 rounded-full bg-[var(--line-strong)]" />
        <PanelHeader nbCoupe={nbCoupe} compact />
        <div className="h-[calc(42vh-86px)] overflow-y-auto no-sb">
          <List quartiers={quartiers} />
        </div>
      </div>

      {/* FAB (mobile) */}
      <button
        onClick={() => setSignalOpen(true)}
        className="absolute right-4 bottom-[calc(42vh+14px)] z-[630] flex h-[50px] items-center gap-2 rounded-[15px] bg-[var(--cyan)] pl-4 pr-5 font-bold text-[var(--cyan-ink)] shadow-[0_10px_30px_rgba(34,211,238,.25)] md:hidden"
      >
        <Zap size={18} /> Signaler
      </button>

      {signalOpen && (
        <SignalModal quartiers={quartiers} onClose={() => setSignalOpen(false)} onDone={onSignalDone} />
      )}

      {toast && (
        <div className="anim-fade fixed bottom-6 left-1/2 z-[950] -translate-x-1/2 rounded-full border border-[var(--line-strong)] bg-[var(--surface-2)] px-5 py-2.5 text-sm font-medium shadow-2xl">
          {toast}
        </div>
      )}
    </main>
  );
}

function PanelHeader({ nbCoupe, compact }: { nbCoupe: number; compact?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${compact ? "py-2" : "px-5 pb-3 pt-4"}`}>
      <span className="text-[15px] font-bold tracking-tight">Coupures en cours</span>
      <span
        className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
        style={{
          color: nbCoupe ? "var(--red)" : "var(--green)",
          borderColor: nbCoupe ? "rgba(240,80,110,.3)" : "rgba(52,211,153,.3)",
        }}
      >
        {nbCoupe ? `${nbCoupe} active${nbCoupe > 1 ? "s" : ""}` : "tout est ok"}
      </span>
    </div>
  );
}

function List({ quartiers }: { quartiers: ReturnType<typeof quartiersDeVille> }) {
  if (quartiers.length === 0)
    return (
      <p className="py-8 text-center text-sm text-[var(--txt-3)]">
        Aucun quartier pour cette ville.
      </p>
    );
  return (
    <div className="divide-y divide-[var(--line)]">
      {quartiers.map((q) => (
        <QuartierRow key={q.id} q={q} />
      ))}
    </div>
  );
}
