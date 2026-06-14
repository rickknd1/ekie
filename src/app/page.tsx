"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Bell, LocateFixed } from "lucide-react";
import { VILLES, getVille, getQuartier, quartiersDeVille } from "@/lib/data";
import { getZone, setZone } from "@/lib/follows";
import SignalModal from "@/components/SignalModal";
import LocateModal from "@/components/LocateModal";
import MobileSheet, { type Snap } from "@/components/MobileSheet";
import QuartierRow, { sortQuartiers } from "@/components/QuartierRow";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [signalOpen, setSignalOpen] = useState(false);
  const [locateOpen, setLocateOpen] = useState(false);
  const [snap, setSnap] = useState<Snap>("collapsed");
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const z = getZone();
    if (z && getQuartier(z)) setZoneId(z);
    else setLocateOpen(true); // 1re visite → demande la zone
    setReady(true);
  }, []);

  const zone = zoneId ? getQuartier(zoneId) : null;
  const ville = (zone ? getVille(zone.villeId) : VILLES[0]) || VILLES[0];
  const quartiers = useMemo(() => sortQuartiers(quartiersDeVille(ville.id)), [ville.id]);
  const nbCoupe = quartiers.filter((q) => q.etat === "coupe").length;

  function chooseZone(quartierId: string) {
    setZone(quartierId);
    setZoneId(quartierId);
    setLocateOpen(false);
  }

  function onSignalDone(type: "coupure" | "retablissement") {
    setSignalOpen(false);
    setToast(type === "coupure" ? "Coupure signalée. Merci 🙏" : "Rétablissement signalé. Merci 🙏");
    setTimeout(() => setToast(null), 2600);
  }

  const Badge = (
    <span
      className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
      style={{
        color: nbCoupe ? "var(--red)" : "var(--green)",
        borderColor: nbCoupe ? "rgba(240,80,110,.3)" : "rgba(52,211,153,.3)",
      }}
    >
      {nbCoupe ? `${nbCoupe} active${nbCoupe > 1 ? "s" : ""}` : "tout est ok"}
    </span>
  );

  const fabBottom =
    snap === "collapsed" ? "calc(12vh + 16px)" : snap === "half" ? "calc(40vh + 16px)" : "0";

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <MapView ville={ville} quartiers={quartiers} youId={zoneId} onSelect={(id) => router.push(`/quartier/${id}`)} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[610] h-32 bg-gradient-to-b from-[var(--bg)] to-transparent" />

      {/* header : zone (localisation) */}
      <header className="absolute inset-x-0 top-0 z-[620] flex items-center justify-between px-5 pt-5">
        <button onClick={() => setLocateOpen(true)} className="flex items-center gap-3 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-[var(--line-strong)] bg-[var(--surface)]">
            <Zap size={18} className="text-[var(--cyan)]" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--txt-3)] leading-none">
              Ma zone
            </div>
            <div className="flex items-center gap-1 text-[17px] font-bold tracking-tight">
              {zone ? (
                <>
                  {zone.nom}
                  <span className="font-normal text-[var(--txt-3)] text-sm">· {ville.nom}</span>
                </>
              ) : (
                "Choisir ma zone"
              )}
              <LocateFixed size={15} className="ml-0.5 text-[var(--cyan)]" />
            </div>
          </div>
        </button>
        <Link
          href="/notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)]"
        >
          <Bell size={18} className="text-[var(--cyan)]" />
        </Link>
      </header>

      {/* DESKTOP : panneau latéral */}
      <aside className="absolute bottom-5 left-5 top-24 z-[615] hidden w-[360px] flex-col overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--surface)] md:flex">
        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <span className="text-[15px] font-bold tracking-tight">Coupures en cours</span>
          {Badge}
        </div>
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

      {/* MOBILE : bottom sheet repliable */}
      <MobileSheet snap={snap} onSnap={setSnap} title="Coupures en cours" badge={Badge}>
        <List quartiers={quartiers} />
      </MobileSheet>

      {/* FAB (mobile) — suit l'état de la sheet */}
      {snap !== "full" && (
        <button
          onClick={() => setSignalOpen(true)}
          style={{ bottom: fabBottom }}
          className="absolute right-4 z-[630] flex h-[50px] items-center gap-2 rounded-[15px] bg-[var(--cyan)] pl-4 pr-5 font-bold text-[var(--cyan-ink)] shadow-[0_10px_30px_rgba(34,211,238,.25)] transition-[bottom] duration-300 md:hidden"
        >
          <Zap size={18} /> Signaler
        </button>
      )}

      {ready && locateOpen && (
        <LocateModal
          onClose={() => setLocateOpen(false)}
          onSet={chooseZone}
          canClose={Boolean(zone)}
        />
      )}

      {signalOpen && (
        <SignalModal
          quartiers={quartiers}
          defaultQuartierId={zoneId ?? undefined}
          onClose={() => setSignalOpen(false)}
          onDone={onSignalDone}
        />
      )}

      {toast && (
        <div className="anim-fade fixed bottom-6 left-1/2 z-[950] -translate-x-1/2 rounded-full border border-[var(--line-strong)] bg-[var(--surface-2)] px-5 py-2.5 text-sm font-medium shadow-2xl">
          {toast}
        </div>
      )}
    </main>
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
