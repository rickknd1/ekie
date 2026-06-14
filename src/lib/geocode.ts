// Géocodage / autocomplétion réelle via Photon (OpenStreetMap) — gratuit, sans clé.
export type GeoPlace = { nom: string; contexte: string; lat: number; lng: number };

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | undefined>;
}

export async function geocode(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  // biais vers le Cameroun (centre ~ Yaoundé) pour prioriser les résultats locaux
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=fr&lat=4.6&lon=11.5`;
  try {
    const res = await fetch(url, { signal });
    const json = (await res.json()) as { features?: PhotonFeature[] };
    const out: GeoPlace[] = (json.features || []).map((f) => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      const nom = p.name || p.street || p.city || "Lieu";
      const contexte = [p.district, p.city, p.county, p.state, p.country]
        .filter((v, i, a) => v && a.indexOf(v) === i)
        .join(", ");
      return { nom, contexte, lat, lng };
    });
    // garder uniquement le Cameroun + dédoublonner par nom
    const seen = new Set<string>();
    return out
      .filter((x) => /cameroun|cameroon/i.test(x.contexte))
      .filter((x) => {
        const k = x.nom.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
  } catch {
    return [];
  }
}
