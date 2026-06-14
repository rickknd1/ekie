// Données seed (mock) — branchement Supabase prévu en étape suivante (Phase 5).
export type Etat = "coupe" | "ok" | "inconnu";

export interface Ville {
  id: string;
  nom: string;
  region: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface Quartier {
  id: string;
  villeId: string;
  nom: string;
  lat: number;
  lng: number;
  etat: Etat;
  depuisMin?: number; // minutes depuis le changement d'état
  signalements: number;
}

export const VILLES: Ville[] = [
  { id: "yaounde", nom: "Yaoundé", region: "Centre", lat: 3.862, lng: 11.508, zoom: 12 },
  { id: "douala", nom: "Douala", region: "Littoral", lat: 4.052, lng: 9.74, zoom: 12 },
  { id: "bafoussam", nom: "Bafoussam", region: "Ouest", lat: 5.477, lng: 10.418, zoom: 13 },
  { id: "bamenda", nom: "Bamenda", region: "Nord-Ouest", lat: 5.96, lng: 10.146, zoom: 13 },
  { id: "garoua", nom: "Garoua", region: "Nord", lat: 9.301, lng: 13.397, zoom: 13 },
  { id: "maroua", nom: "Maroua", region: "Extrême-Nord", lat: 10.591, lng: 14.316, zoom: 13 },
  { id: "ngaoundere", nom: "Ngaoundéré", region: "Adamaoua", lat: 7.327, lng: 13.584, zoom: 13 },
  { id: "bertoua", nom: "Bertoua", region: "Est", lat: 4.577, lng: 13.684, zoom: 13 },
  { id: "kumba", nom: "Kumba", region: "Sud-Ouest", lat: 4.636, lng: 9.447, zoom: 13 },
  { id: "buea", nom: "Buea", region: "Sud-Ouest", lat: 4.155, lng: 9.241, zoom: 13 },
];

export const QUARTIERS: Quartier[] = [
  // Yaoundé
  { id: "bastos", villeId: "yaounde", nom: "Bastos", lat: 3.886, lng: 11.516, etat: "coupe", depuisMin: 134, signalements: 8 },
  { id: "nlongkak", villeId: "yaounde", nom: "Nlongkak", lat: 3.878, lng: 11.515, etat: "coupe", depuisMin: 45, signalements: 4 },
  { id: "biyem-assi", villeId: "yaounde", nom: "Biyem-Assi", lat: 3.842, lng: 11.486, etat: "coupe", depuisMin: 45, signalements: 5 },
  { id: "essos", villeId: "yaounde", nom: "Essos", lat: 3.876, lng: 11.535, etat: "ok", signalements: 3 },
  { id: "mvan", villeId: "yaounde", nom: "Mvan", lat: 3.823, lng: 11.515, etat: "ok", signalements: 3 },
  { id: "mendong", villeId: "yaounde", nom: "Mendong", lat: 3.83, lng: 11.47, etat: "inconnu", signalements: 0 },
  { id: "mvog-mbi", villeId: "yaounde", nom: "Mvog-Mbi", lat: 3.857, lng: 11.527, etat: "ok", signalements: 2 },
  { id: "ngousso", villeId: "yaounde", nom: "Ngousso", lat: 3.897, lng: 11.541, etat: "inconnu", signalements: 0 },
  // Douala
  { id: "akwa", villeId: "douala", nom: "Akwa", lat: 4.049, lng: 9.704, etat: "coupe", depuisMin: 78, signalements: 6 },
  { id: "bonamoussadi", villeId: "douala", nom: "Bonamoussadi", lat: 4.094, lng: 9.737, etat: "coupe", depuisMin: 22, signalements: 3 },
  { id: "deido", villeId: "douala", nom: "Deïdo", lat: 4.064, lng: 9.71, etat: "ok", signalements: 2 },
  { id: "makepe", villeId: "douala", nom: "Makèpè", lat: 4.083, lng: 9.749, etat: "ok", signalements: 4 },
  { id: "newbell", villeId: "douala", nom: "New-Bell", lat: 4.034, lng: 9.71, etat: "inconnu", signalements: 0 },
  { id: "bonapriso", villeId: "douala", nom: "Bonapriso", lat: 4.028, lng: 9.707, etat: "coupe", depuisMin: 12, signalements: 2 },
  // Bafoussam
  { id: "tamdja", villeId: "bafoussam", nom: "Tamdja", lat: 5.49, lng: 10.42, etat: "coupe", depuisMin: 60, signalements: 3 },
  { id: "kamkop", villeId: "bafoussam", nom: "Kamkop", lat: 5.47, lng: 10.43, etat: "ok", signalements: 1 },
  { id: "banengo", villeId: "bafoussam", nom: "Banengo", lat: 5.465, lng: 10.41, etat: "inconnu", signalements: 0 },
  // Bamenda
  { id: "nkwen", villeId: "bamenda", nom: "Nkwen", lat: 5.98, lng: 10.17, etat: "coupe", depuisMin: 90, signalements: 4 },
  { id: "mankon", villeId: "bamenda", nom: "Mankon", lat: 5.955, lng: 10.13, etat: "ok", signalements: 2 },
  { id: "upstation", villeId: "bamenda", nom: "Up Station", lat: 5.965, lng: 10.155, etat: "inconnu", signalements: 0 },
  // Garoua
  { id: "plateau-gar", villeId: "garoua", nom: "Plateau", lat: 9.305, lng: 13.39, etat: "ok", signalements: 1 },
  { id: "roumde", villeId: "garoua", nom: "Roumdé Adjia", lat: 9.31, lng: 13.41, etat: "inconnu", signalements: 0 },
  // Maroua
  { id: "domayo", villeId: "maroua", nom: "Domayo", lat: 10.59, lng: 14.32, etat: "coupe", depuisMin: 30, signalements: 2 },
  { id: "founange", villeId: "maroua", nom: "Founangué", lat: 10.6, lng: 14.31, etat: "inconnu", signalements: 0 },
  // Ngaoundéré
  { id: "dang", villeId: "ngaoundere", nom: "Dang", lat: 7.36, lng: 13.56, etat: "ok", signalements: 1 },
  { id: "baladji", villeId: "ngaoundere", nom: "Baladji", lat: 7.33, lng: 13.58, etat: "inconnu", signalements: 0 },
  // Bertoua
  { id: "nkolbikon", villeId: "bertoua", nom: "Nkolbikon", lat: 4.58, lng: 13.68, etat: "coupe", depuisMin: 50, signalements: 2 },
  { id: "mokolo-ber", villeId: "bertoua", nom: "Mokolo", lat: 4.575, lng: 13.69, etat: "inconnu", signalements: 0 },
  // Kumba
  { id: "fiango", villeId: "kumba", nom: "Fiango", lat: 4.64, lng: 9.45, etat: "ok", signalements: 1 },
  { id: "kosala", villeId: "kumba", nom: "Kosala", lat: 4.63, lng: 9.44, etat: "inconnu", signalements: 0 },
  // Buea
  { id: "molyko", villeId: "buea", nom: "Molyko", lat: 4.155, lng: 9.286, etat: "coupe", depuisMin: 18, signalements: 3 },
  { id: "bonduma", villeId: "buea", nom: "Bonduma", lat: 4.16, lng: 9.27, etat: "ok", signalements: 1 },
];

export const ETAT_LABEL: Record<Etat, string> = {
  coupe: "Coupé",
  ok: "Rétabli",
  inconnu: "Inconnu",
};
export const ETAT_COLOR: Record<Etat, string> = {
  coupe: "var(--red)",
  ok: "var(--green)",
  inconnu: "var(--gray)",
};

export const getVille = (id: string) => VILLES.find((v) => v.id === id);
export const getQuartier = (id: string) => QUARTIERS.find((q) => q.id === id);
export const quartiersDeVille = (villeId: string) =>
  QUARTIERS.filter((q) => q.villeId === villeId);

export function formatDepuis(min?: number): string {
  if (min == null) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}
