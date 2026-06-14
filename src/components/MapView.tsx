"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ETAT_COLOR, type Quartier, type Ville } from "@/lib/data";

interface Props {
  ville: Ville;
  quartiers: Quartier[];
  youId?: string | null;
  pinnedIds?: string[];
  focus?: { lat: number; lng: number; nonce: number } | null;
  onSelect?: (id: string) => void;
}

export default function MapView({ ville, quartiers, youId, pinnedIds, focus, onSelect }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // init once
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      zoomControl: false,
      attributionControl: false,
      center: [ville.lat, ville.lng],
      zoom: ville.zoom,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 60);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [ville.lat, ville.lng, ville.zoom]);

  // recenter on ville change
  useEffect(() => {
    mapRef.current?.setView([ville.lat, ville.lng], ville.zoom, { animate: true });
  }, [ville]);

  // recentrage explicite (bouton recentrer / focus sur un lieu)
  useEffect(() => {
    if (focus && mapRef.current) {
      const z = Math.max(mapRef.current.getZoom(), 14);
      mapRef.current.setView([focus.lat, focus.lng], z, { animate: true });
    }
  }, [focus]);

  // draw circles + badges
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const pins = new Set(pinnedIds || []);
    quartiers.forEach((q) => {
      if (q.etat !== "inconnu") {
        // quartier avec un vrai signal → cercle coloré + compteur
        const color = getComputedColor(q.etat);
        L.circle([q.lat, q.lng], {
          radius: 1050,
          color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.18,
        })
          .on("click", () => onSelectRef.current?.(q.id))
          .addTo(layer);
        if (q.signalements > 0) {
          L.marker([q.lat, q.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div class="count" style="border-color:${color}">${q.signalements}</div>`,
              iconSize: [22, 22],
            }),
          })
            .on("click", () => onSelectRef.current?.(q.id))
            .addTo(layer);
        }
      } else if (pins.has(q.id) && q.id !== youId) {
        // quartier exploré (sans données) → petit pin neutre cliquable
        L.marker([q.lat, q.lng], {
          icon: L.divIcon({ className: "", html: `<div class="pin"></div>`, iconSize: [14, 14] }),
        })
          .on("click", () => onSelectRef.current?.(q.id))
          .addTo(layer);
      }
    });
    // marqueur "tu es ici" (toujours visible, cliquable)
    const you = quartiers.find((q) => q.id === youId);
    if (you) {
      L.marker([you.lat, you.lng], {
        zIndexOffset: 1000,
        icon: L.divIcon({ className: "", html: `<div class="you-dot"></div>`, iconSize: [16, 16] }),
      })
        .on("click", () => onSelectRef.current?.(you.id))
        .addTo(layer);
    }
  }, [quartiers, youId, pinnedIds]);

  return <div ref={elRef} className="absolute inset-0" />;
}

// résout les var(--xxx) en couleur réelle pour Leaflet
function getComputedColor(etat: Quartier["etat"]): string {
  if (typeof window === "undefined") return "#7C8696";
  const varName = ETAT_COLOR[etat].replace("var(", "").replace(")", "");
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || "#7C8696";
}
