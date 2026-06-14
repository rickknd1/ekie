"use client";
import { useState } from "react";
import { X, Zap, Check, ShieldCheck } from "lucide-react";
import type { Quartier } from "@/lib/data";

export default function SignalModal({
  quartiers,
  defaultQuartierId,
  onClose,
  onDone,
}: {
  quartiers: Quartier[];
  defaultQuartierId?: string;
  onClose: () => void;
  onDone: (type: "coupure" | "retablissement", quartierId: string) => void;
}) {
  const [qid, setQid] = useState(defaultQuartierId || quartiers[0]?.id);

  return (
    <div
      className="anim-fade fixed inset-0 z-[900] flex items-end justify-center bg-black/55 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="anim-sheet w-full max-w-[460px] rounded-t-[22px] border-t border-[var(--line)] bg-[var(--surface)] px-5 pb-7 pt-3 sm:rounded-[22px] sm:border">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[var(--line-strong)] sm:hidden" />
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[19px] font-bold tracking-tight">Signaler</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)]"
          >
            <X size={16} className="text-[var(--txt-2)]" />
          </button>
        </div>
        <p className="mb-4 text-sm text-[var(--txt-3)]">
          1 tap, ça aide tout ton quartier.
        </p>

        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--txt-3)]">
          Quartier
        </label>
        <select
          value={qid}
          onChange={(e) => setQid(e.target.value)}
          className="mb-4 h-11 w-full rounded-[12px] border border-[var(--line)] bg-[var(--bg)] px-3 text-sm outline-none"
        >
          {quartiers.map((q) => (
            <option key={q.id} value={q.id}>
              {q.nom}
            </option>
          ))}
        </select>

        <button
          onClick={() => onDone("coupure", qid)}
          className="mb-3 flex w-full items-center gap-3 rounded-[14px] border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3.5 text-left transition active:scale-[.99]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(240,80,110,0.15)]">
            <Zap size={18} className="text-[var(--red)]" />
          </span>
          <span>
            <b className="block text-[15px] font-bold">Coupure de courant</b>
            <span className="text-xs text-[var(--txt-3)]">signaler que c&apos;est coupé</span>
          </span>
        </button>
        <button
          onClick={() => onDone("retablissement", qid)}
          className="flex w-full items-center gap-3 rounded-[14px] border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3.5 text-left transition active:scale-[.99]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(52,211,153,0.15)]">
            <Check size={18} className="text-[var(--green)]" />
          </span>
          <span>
            <b className="block text-[15px] font-bold">Le courant est revenu</b>
            <span className="text-xs text-[var(--txt-3)]">signaler le rétablissement</span>
          </span>
        </button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[var(--txt-3)]">
          <ShieldCheck size={13} /> 1 signalement / 30 min pour éviter le spam
        </p>
      </div>
    </div>
  );
}
