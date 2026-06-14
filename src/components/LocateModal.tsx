"use client";
import { useEffect, useState } from "react";
import { X, Search, LocateFixed, Loader2, MapPin, Check, AlertCircle } from "lucide-react";
import { getVille, type Quartier } from "@/lib/data";
import { nearestQuartier, searchQuartiers } from "@/lib/geo";
import { geocode, type GeoPlace } from "@/lib/geocode";
import { makeZone } from "@/lib/zones";

export default function LocateModal({
  onClose,
  onSet,
  canClose = true,
}: {
  onClose: () => void;
  onSet: (zone: Quartier) => void;
  canClose?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "locating" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [found, setFound] = useState<{ quartier: Quartier; distanceKm: number } | null>(null);
  const [query, setQuery] = useState("");
  const [geo, setGeo] = useState<GeoPlace[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const seedMatches = searchQuartiers(query);

  // autocomplétion réelle (debounce 300ms)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setGeo([]);
      setGeoLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setGeoLoading(true);
    const t = setTimeout(async () => {
      const r = await geocode(q, ctrl.signal);
      setGeo(r);
      setGeoLoading(false);
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  function locate() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrMsg("Géolocalisation non disponible sur cet appareil.");
      return;
    }
    setStatus("locating");
    setFound(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const res = nearestQuartier(pos.coords.latitude, pos.coords.longitude);
        if (!res) {
          setStatus("error");
          setErrMsg("Aucune zone trouvée.");
          return;
        }
        if (res.distanceKm <= 80) {
          onSet(res.quartier);
          return;
        }
        setFound(res);
        setStatus("idle");
      },
      (err) => {
        setStatus("error");
        setErrMsg(
          err.code === err.PERMISSION_DENIED
            ? "Localisation refusée. Cherche ta zone à la main."
            : "Impossible de te localiser. Cherche ta zone à la main."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  const seedIds = new Set(seedMatches.map((q) => q.nom.toLowerCase()));
  const geoFiltered = geo.filter((p) => !seedIds.has(p.nom.toLowerCase()));

  return (
    <div
      className="anim-fade fixed inset-0 z-[900] flex items-end justify-center bg-black/55 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && canClose && onClose()}
    >
      <div className="anim-sheet flex max-h-[88dvh] w-full max-w-[460px] flex-col rounded-t-[22px] border-t border-[var(--line)] bg-[var(--surface)] px-5 pb-7 pt-3 sm:rounded-[22px] sm:border">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[var(--line-strong)] sm:hidden" />
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[19px] font-bold tracking-tight">Ta zone</h2>
          {canClose && (
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)]"
            >
              <X size={16} className="text-[var(--txt-2)]" />
            </button>
          )}
        </div>
        <p className="mb-4 text-sm text-[var(--txt-3)]">
          Localise-toi pour voir l&apos;état du courant près de chez toi.
        </p>

        {/* auto-localisation */}
        <button
          onClick={locate}
          disabled={status === "locating"}
          className="flex w-full items-center gap-3 rounded-[14px] border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3.5 text-left disabled:opacity-70"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(34,211,238,0.15)]">
            {status === "locating" ? (
              <Loader2 size={18} className="animate-spin text-[var(--cyan)]" />
            ) : (
              <LocateFixed size={18} className="text-[var(--cyan)]" />
            )}
          </span>
          <span>
            <b className="block text-[15px] font-bold">
              {status === "locating" ? "Localisation…" : "Activer ma localisation"}
            </b>
            <span className="text-xs text-[var(--txt-3)]">automatique, via le GPS</span>
          </span>
        </button>

        {found && (
          <div className="mt-3 rounded-[12px] border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-[var(--txt-3)]" />
                <div>
                  <div className="text-sm font-semibold">
                    {found.quartier.nom}
                    <span className="font-normal text-[var(--txt-3)]">
                      {" "}
                      · {getVille(found.quartier.villeId)?.nom}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--txt-3)]">
                    zone couverte la plus proche · ~{Math.round(found.distanceKm)} km
                  </div>
                </div>
              </div>
              <button
                onClick={() => onSet(found.quartier)}
                className="flex items-center gap-1.5 rounded-full bg-[var(--cyan)] px-3.5 py-1.5 text-[13px] font-bold text-[var(--cyan-ink)]"
              >
                <Check size={14} /> OK
              </button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--txt-3)]">
              Tu sembles loin des villes couvertes — tu peux aussi taper ton quartier ci-dessous 👇
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-[13px] text-[var(--txt-2)]">
            <AlertCircle size={15} className="shrink-0 text-[var(--red)]" /> {errMsg}
          </div>
        )}

        {/* séparateur */}
        <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-[var(--txt-3)]">
          <div className="h-px flex-1 bg-[var(--line)]" /> ou <div className="h-px flex-1 bg-[var(--line)]" />
        </div>

        {/* recherche réelle (autocomplétion) */}
        <div className="flex h-11 items-center gap-2.5 rounded-[12px] border border-[var(--line)] bg-[var(--bg)] px-3">
          <Search size={16} className="text-[var(--txt-3)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tape ton quartier (ex. Obobogo, Bastos…)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--txt-3)]"
          />
          {geoLoading && <Loader2 size={15} className="animate-spin text-[var(--txt-3)]" />}
        </div>

        {query.trim().length >= 1 && (
          <div className="mt-2 flex-1 overflow-y-auto no-sb">
            {/* quartiers connus (instantané) */}
            {seedMatches.map((q) => (
              <button
                key={`s-${q.id}`}
                onClick={() => onSet(q)}
                className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition hover:bg-[var(--surface-2)]"
              >
                <MapPin size={15} className="text-[var(--cyan)]" />
                <span className="text-sm font-medium">{q.nom}</span>
                <span className="ml-auto text-[11px] text-[var(--txt-3)]">
                  {getVille(q.villeId)?.nom}
                </span>
              </button>
            ))}
            {/* lieux réels géocodés */}
            {geoFiltered.map((p, i) => (
              <button
                key={`g-${i}`}
                onClick={() => onSet(makeZone(p.nom, p.lat, p.lng))}
                className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition hover:bg-[var(--surface-2)]"
              >
                <MapPin size={15} className="text-[var(--txt-3)]" />
                <span className="truncate text-sm font-medium">{p.nom}</span>
                <span className="ml-auto shrink-0 truncate pl-2 text-[11px] text-[var(--txt-3)]">
                  {p.contexte || "Cameroun"}
                </span>
              </button>
            ))}
            {!geoLoading && seedMatches.length === 0 && geoFiltered.length === 0 && (
              <p className="px-2 py-3 text-sm text-[var(--txt-3)]">Aucun résultat.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
