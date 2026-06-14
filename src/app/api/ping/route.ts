import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Pingé chaque jour par le cron Vercel → garde le projet Supabase actif
// (le Free tier met en pause après 7 jours d'inactivité).
export async function GET() {
  if (!supabase) return NextResponse.json({ ok: false, reason: "supabase non configuré" });
  const { error } = await supabase.rpc("etats");
  return NextResponse.json({ ok: !error, pinged: true });
}
