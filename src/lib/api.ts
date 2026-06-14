import { supabase, isSupabase } from "@/lib/supabase";
import type { Quartier, Etat } from "@/lib/data";

export type EtatLive = { etat: Etat; depuisMin?: number; nb: number };

// État courant par quartier depuis la BDD. null = Supabase non configuré (→ on garde le mock).
export async function fetchEtats(): Promise<Record<string, EtatLive> | null> {
  if (!isSupabase || !supabase) return null;
  const { data, error } = await supabase.rpc("etats");
  if (error || !data) return {};
  const map: Record<string, EtatLive> = {};
  for (const r of data as { quartier_id: string; etat: string; depuis: string; nb: number }[]) {
    const depuisMin = r.depuis
      ? Math.max(0, Math.round((Date.now() - new Date(r.depuis).getTime()) / 60000))
      : undefined;
    map[r.quartier_id] = { etat: r.etat as Etat, depuisMin, nb: r.nb };
  }
  return map;
}

// Applique les états live sur la liste de quartiers de référence.
// Un quartier sans signalement récent → "inconnu".
export function applyEtats(list: Quartier[], map: Record<string, EtatLive>): Quartier[] {
  return list.map((q) => {
    const e = map[q.id];
    return e
      ? { ...q, etat: e.etat, depuisMin: e.depuisMin, signalements: e.nb }
      : { ...q, etat: "inconnu" as Etat, depuisMin: undefined, signalements: 0 };
  });
}

// Enregistre un signalement (RPC anti-spam côté serveur).
export async function signaler(
  quartierId: string,
  type: "coupure" | "retablissement",
  deviceId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabase || !supabase) return { ok: true };
  const { data, error } = await supabase.rpc("signaler", {
    p_quartier: quartierId,
    p_type: type,
    p_device: deviceId,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; error?: string };
}

// Abonnement temps réel aux nouveaux signalements → callback à chaque insert.
export function subscribeSignalements(cb: () => void): () => void {
  const sb = supabase;
  if (!sb) return () => {};
  const ch = sb
    .channel("signalements-live")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "signalements" }, cb)
    .subscribe();
  return () => {
    sb.removeChannel(ch);
  };
}
