"use client";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/follows";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export type PushResult = { ok: boolean; reason?: "unsupported" | "denied" | "error" };

export async function subscribePush(quartierId: string): Promise<PushResult> {
  if (!pushSupported() || !VAPID || !supabase) return { ok: false, reason: "unsupported" };
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, reason: "denied" };
  const reg = await registerSW();
  if (!reg) return { ok: false, reason: "error" };
  try {
    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID),
      }));
    const device = getDeviceId();
    // delete + insert (évite un UPDATE non couvert par les policies RLS)
    await supabase.from("abonnements").delete().eq("device_id", device).eq("quartier_id", quartierId);
    await supabase.from("abonnements").insert({
      device_id: device,
      quartier_id: quartierId,
      push_token: sub.toJSON(),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function unsubscribePush(quartierId: string): Promise<void> {
  const device = getDeviceId();
  if (supabase) {
    await supabase.from("abonnements").delete().eq("device_id", device).eq("quartier_id", quartierId);
  }
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return buf;
}
