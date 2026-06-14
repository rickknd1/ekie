import { QUARTIERS, getVille, type Quartier } from "@/lib/data";

// Distance Haversine en km entre deux points GPS.
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Quartier seed le plus proche d'une position GPS.
export function nearestQuartier(
  lat: number,
  lng: number
): { quartier: Quartier; distanceKm: number } | null {
  let best: Quartier | null = null;
  let bestD = Infinity;
  for (const q of QUARTIERS) {
    const d = distanceKm(lat, lng, q.lat, q.lng);
    if (d < bestD) {
      bestD = d;
      best = q;
    }
  }
  return best ? { quartier: best, distanceKm: bestD } : null;
}

// Recherche texte (autocomplétion) sur quartiers + leur ville.
export function searchQuartiers(query: string, limit = 8): Quartier[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = QUARTIERS.map((quartier) => {
    const ville = getVille(quartier.villeId);
    const hayNom = quartier.nom.toLowerCase();
    const hayVille = ville?.nom.toLowerCase() ?? "";
    let score = -1;
    if (hayNom.startsWith(q)) score = 3;
    else if (hayNom.includes(q)) score = 2;
    else if (hayVille.includes(q)) score = 1;
    return { quartier, score };
  }).filter((s) => s.score >= 0);
  scored.sort((a, b) => b.score - a.score || a.quartier.nom.localeCompare(b.quartier.nom));
  return scored.slice(0, limit).map((s) => s.quartier);
}
