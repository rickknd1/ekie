"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, BellOff, ChevronRight } from "lucide-react";
import { getVille, formatDepuis, type Quartier } from "@/lib/data";
import { resolveQuartier } from "@/lib/zones";
import { getFollows, toggleFollow } from "@/lib/follows";
import { unsubscribePush } from "@/lib/push";
import { fetchEtats, applyEtats } from "@/lib/api";

export default function Notifications() {
  const router = useRouter();
  const [followed, setFollowed] = useState<Quartier[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const base = getFollows()
      .map((id) => resolveQuartier(id))
      .filter((q): q is Quartier => Boolean(q));
    setFollowed(base);
    setReady(true);
    // état live
    fetchEtats().then((m) => {
      if (m) setFollowed(applyEtats(base, m));
    });
  }, []);

  function unfollow(id: string) {
    unsubscribePush(id);
    toggleFollow(id);
    setFollowed((list) => list.filter((q) => q.id !== id));
  }

  const alerts = followed
    .filter((q) => q.etat !== "inconnu")
    .map((q) => ({
      q,
      text: q.etat === "coupe" ? `Coupure signalée à ${q.nom}` : `Le courant est revenu à ${q.nom}`,
      t: q.etat === "coupe" ? `il y a ${formatDepuis(q.depuisMin)}` : "récemment",
    }));

  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-[460px] flex-col px-5 pt-5">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-[var(--line)] bg-[var(--surface)]"
        >
          <ArrowLeft size={18} className="text-[var(--txt-2)]" />
        </button>
        <h1 className="text-[19px] font-bold tracking-tight">Mes suivis</h1>
      </div>

      {!ready ? null : followed.length === 0 ? (
        <div className="mt-16 flex flex-col items-center px-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] border border-[var(--line)] bg-[var(--surface)]">
            <BellOff size={26} className="text-[var(--txt-3)]" />
          </div>
          <h2 className="text-base font-bold">Aucun quartier suivi</h2>
          <p className="mt-2 max-w-[260px] text-sm text-[var(--txt-3)]">
            Suis un quartier depuis la carte pour être prévenu dès qu&apos;une coupure ou un
            rétablissement est signalé.
          </p>
          <Link
            href="/"
            className="mt-6 flex h-11 items-center justify-center rounded-[13px] bg-[var(--cyan)] px-6 text-sm font-bold text-[var(--cyan-ink)]"
          >
            Voir la carte
          </Link>
        </div>
      ) : (
        <div className="overflow-y-auto no-sb pb-6">
          {alerts.length > 0 && (
            <>
              <SectionTitle>Récentes</SectionTitle>
              <div className="mb-7 space-y-2.5">
                {alerts.map((a, i) => (
                  <Link
                    key={i}
                    href={`/quartier/${a.q.id}`}
                    className="flex items-center gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                      style={{
                        background:
                          a.q.etat === "coupe"
                            ? "color-mix(in srgb, var(--red) 14%, transparent)"
                            : "color-mix(in srgb, var(--green) 14%, transparent)",
                      }}
                    >
                      <Bell
                        size={16}
                        style={{ color: a.q.etat === "coupe" ? "var(--red)" : "var(--green)" }}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{a.text}</div>
                      <div className="text-[11px] text-[var(--txt-3)]">{a.t}</div>
                    </div>
                    <ChevronRight size={16} className="text-[var(--txt-3)]" />
                  </Link>
                ))}
              </div>
            </>
          )}

          <SectionTitle>Quartiers suivis ({followed.length})</SectionTitle>
          <div className="divide-y divide-[var(--line)]">
            {followed.map((q) => {
              const color =
                q.etat === "coupe" ? "var(--red)" : q.etat === "ok" ? "var(--green)" : "var(--gray)";
              const meta =
                q.etat === "coupe"
                  ? `coupé · ${formatDepuis(q.depuisMin)}`
                  : q.etat === "ok"
                  ? "rétabli"
                  : "pas de signalement";
              return (
                <div key={q.id} className="flex items-center justify-between py-3">
                  <button
                    onClick={() => router.push(`/quartier/${q.id}`)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                    <div>
                      <div className="text-sm font-semibold">{q.nom}</div>
                      <div className="text-[11px] text-[var(--txt-3)]">
                        {getVille(q.villeId)?.nom} · {meta}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => unfollow(q.id)}
                    aria-label="Ne plus suivre"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--txt-3)] transition hover:text-[var(--red)]"
                  >
                    <BellOff size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--txt-3)]">
      {children}
    </div>
  );
}
