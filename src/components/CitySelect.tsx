"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { VILLES } from "@/lib/data";

export default function CitySelect({
  villeId,
  onChange,
}: {
  villeId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const current = VILLES.find((v) => v.id === villeId);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const list = VILLES.filter((v) =>
    v.nom.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-left"
      >
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--txt-3)] leading-none">
            Ville
          </div>
          <div className="flex items-center gap-1 text-[19px] font-bold tracking-tight">
            {current?.nom}
            <ChevronDown
              size={16}
              className={`text-[var(--txt-3)] transition ${open ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </button>

      {open && (
        <div className="anim-fade absolute top-[calc(100%+10px)] left-0 z-[700] w-[270px] rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-2 shadow-2xl">
          <div className="mb-2 flex items-center gap-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] px-3 h-10">
            <Search size={16} className="text-[var(--txt-3)]" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher une ville…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--txt-3)]"
            />
          </div>
          <div className="max-h-[230px] overflow-y-auto no-sb">
            {list.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  onChange(v.id);
                  setOpen(false);
                  setQ("");
                }}
                className={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-sm transition hover:bg-[var(--surface-2)] ${
                  v.id === villeId ? "text-[var(--cyan)]" : "text-[var(--txt)]"
                }`}
              >
                <MapPin size={15} className="opacity-70" />
                <span className="font-medium">{v.nom}</span>
                <span className="ml-auto text-[11px] text-[var(--txt-3)]">
                  {v.region}
                </span>
              </button>
            ))}
            {list.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-[var(--txt-3)]">
                Aucune ville
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
