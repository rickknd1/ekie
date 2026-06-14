import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE;
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:contact@ekie.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function POST(req: Request) {
  if (!URL || !SERVICE || !VAPID_PRIVATE) {
    return NextResponse.json({ ok: false, reason: "non configuré" });
  }
  const { quartierId, quartierNom, type, deviceId } = await req.json();
  if (!quartierId || !type) return NextResponse.json({ ok: false, reason: "params" });

  const sb = createClient(URL, SERVICE);
  const { data: abos } = await sb
    .from("abonnements")
    .select("device_id, push_token")
    .eq("quartier_id", quartierId);

  if (!abos || abos.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const title = type === "coupure" ? "⚡ Coupure signalée" : "✅ Courant rétabli";
  const body = `${quartierNom || "Ton quartier"} — ${
    type === "coupure" ? "le courant est coupé" : "le courant est revenu"
  }`;
  const payload = JSON.stringify({ title, body, url: `/quartier/${quartierId}`, tag: quartierId });

  let sent = 0;
  await Promise.all(
    abos
      .filter((a) => a.device_id !== deviceId)
      .map(async (a) => {
        try {
          await webpush.sendNotification(a.push_token as webpush.PushSubscription, payload);
          sent++;
        } catch (e: unknown) {
          const code = (e as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) {
            await sb
              .from("abonnements")
              .delete()
              .eq("quartier_id", quartierId)
              .eq("device_id", a.device_id);
          }
        }
      })
  );

  return NextResponse.json({ ok: true, sent });
}
