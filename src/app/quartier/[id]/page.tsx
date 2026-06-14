"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Zap, ZapOff, Check } from "lucide-react";
import { getQuartier, getVille, ETAT_LABEL, formatDepuis } from "@/lib/data";
import { isFollowing, toggleFollow } from "@/lib/follows";

export default function QuartierDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const q = getQuartier(id);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (q) setFollowing(isFollowing(q.id));
  }, [q]);

  if (!q) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[var(--txt-2)]">Quartier introuvable.</p>
        <button onClick={() => router.push("/")} className="text-sm text-[var(--cyan)]">
          Retour à la carte
        </button>
      </main>
    );
  }

  const ville = getVille(q.villeId);
  const isCoupe = q.etat === "coupe";
  const color = isCoupe ? "var(--red)" : q.etat === "ok" ? "var(--green)" : "var(--gray)";

  const history =
    q.etat === "inconnu"
      ? []
      : [
          { etat: "coupe", label: "Coupure signalée", t: "il y a 12 min" },
          { etat: "coupe", label: "Coupure signalée", t: "il y a 40 min" },
          { etat: "ok", label: "Rétablissement", t: "il y a 3 h" },
        ];

  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-[460px] flex-col px-5 pt-5">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-[var(--line)] bg-[var(--surface)]"
        >
          <ArrowLeft size={18} className="text-[var(--txt-2)]" />
        </button>
        <div>
          <h1 className="text-[19px] font-bold leading-tight tracking-tight">{q.nom}</h1>
          <p className="text-[11px] text-[var(--txt-3)]">{ville?.nom}</p>
        </div>
      </div>

      {/* état */}
      <div
        className="mb-4 rounded-[16px] p-6 text-center"
        style={{ background: `color-mix(in srgb, ${color} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}
      >
        <div
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[16px]"
          style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}
        >
          {isCoupe ? (
            <ZapOff size={26} style={{ color }} />
          ) : q.etat === "ok" ? (
            <Zap size={26} style={{ color }} />
          ) : (
            <Bell size={26} style={{ color }} />
          )}
        </div>
        <div className="text-[22px] font-extrabold tracking-wide" style={{ color }}>
          {ETAT_LABEL[q.etat].toUpperCase()}
        </div>
        <div className="mt-1 text-sm text-[var(--txt-3)]">
          {isCoupe
            ? `depuis ${formatDepuis(q.depuisMin)} · ${q.signalements} signalements`
            : q.etat === "ok"
            ? `${q.signalements} signalements`
            : "aucun signalement récent"}
        </div>
      </div>

      {/* suivre */}
      <div className="mb-6 flex items-center justify-between rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Bell size={19} className="text-[var(--cyan)]" />
          <div>
            <div className="text-sm font-semibold">Suivre ce quartier</div>
            <div className="text-[11px] text-[var(--txt-3)]">prévenu dès que l&apos;état change</div>
          </div>
        </div>
        <button
          onClick={() => setFollowing(toggleFollow(q.id))}
          className="h-[27px] w-[46px] rounded-full p-[3px] transition"
          style={{ background: following ? "var(--cyan)" : "var(--line-strong)" }}
          aria-pressed={following}
        >
          <span
            className="block h-[21px] w-[21px] rounded-full bg-white transition"
            style={{ transform: following ? "translateX(19px)" : "none" }}
          />
        </button>
      </div>

      {/* historique */}
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--txt-3)]">
        Derniers signalements
      </div>
      {history.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--txt-3)]">
          Personne n&apos;a encore signalé ici. Sois le premier depuis la carte.
        </p>
      ) : (
        <div className="mt-3 divide-y divide-[var(--line)]">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: h.etat === "coupe" ? "var(--red)" : "var(--green)" }}
                />
                <span className="text-sm">{h.label}</span>
              </div>
              <span className="text-[11px] text-[var(--txt-3)]">{h.t}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
