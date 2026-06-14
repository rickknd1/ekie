"use client";
import Link from "next/link";
import { ETAT_LABEL, formatDepuis, type Quartier } from "@/lib/data";

export default function QuartierRow({ q }: { q: Quartier }) {
  const color =
    q.etat === "coupe" ? "var(--red)" : q.etat === "ok" ? "var(--green)" : "var(--gray)";
  const meta =
    q.etat === "coupe"
      ? `coupé · ${formatDepuis(q.depuisMin)} · ${q.signalements} signal.`
      : q.etat === "ok"
      ? `rétabli · ${q.signalements} signal.`
      : "aucun signalement";
  return (
    <Link
      href={`/quartier/${q.id}`}
      className="flex items-center justify-between py-3 transition hover:opacity-80"
    >
      <div className="flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <span className="text-sm font-semibold">{q.nom}</span>
      </div>
      <span className="text-[11px] text-[var(--txt-3)]">{meta}</span>
    </Link>
  );
}

export function sortQuartiers(list: Quartier[]): Quartier[] {
  const rank: Record<Quartier["etat"], number> = { coupe: 0, ok: 1, inconnu: 2 };
  return [...list].sort(
    (a, b) =>
      rank[a.etat] - rank[b.etat] || (b.depuisMin ?? 0) - (a.depuisMin ?? 0)
  );
}

export { ETAT_LABEL };
