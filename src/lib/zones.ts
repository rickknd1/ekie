// Registre de zones : fusionne les quartiers seed + les lieux géocodés choisis par l'utilisateur.
// Une "zone" géocodée est représentée comme un Quartier (id = slug du nom) pour réutiliser tout le code.
import { QUARTIERS, VILLES, type Quartier } from "@/lib/data";
import { distanceKm } from "@/lib/geo";

const REG_KEY = "ekie:zones";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function nearestVilleId(lat: number, lng: number): string {
  let best = VILLES[0];
  let bd = Infinity;
  for (const v of VILLES) {
    const d = distanceKm(lat, lng, v.lat, v.lng);
    if (d < bd) {
      bd = d;
      best = v;
    }
  }
  return best.id;
}

export function makeZone(nom: string, lat: number, lng: number): Quartier {
  return {
    id: slugify(nom),
    villeId: nearestVilleId(lat, lng),
    nom,
    lat,
    lng,
    etat: "inconnu",
    signalements: 0,
  };
}

function getRegistry(): Record<string, Quartier> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(REG_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveZone(z: Quartier): void {
  if (typeof window === "undefined") return;
  const reg = getRegistry();
  reg[z.id] = z;
  localStorage.setItem(REG_KEY, JSON.stringify(reg));
}

// Résout un quartier par id : seed d'abord, puis zones géocodées mémorisées.
export function resolveQuartier(id: string): Quartier | undefined {
  return QUARTIERS.find((q) => q.id === id) || getRegistry()[id];
}

// Quartiers d'une ville = seed + zones géocodées rattachées à cette ville.
export function quartiersOfVille(villeId: string): Quartier[] {
  const reg = Object.values(getRegistry()).filter((z) => z.villeId === villeId);
  return [...QUARTIERS.filter((q) => q.villeId === villeId), ...reg];
}
