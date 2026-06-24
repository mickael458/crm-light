import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// Echange le code OAuth (Google) contre une session, puis redirige l'utilisateur.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = await createServerSupabase();

  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  // Derriere le proxy Vercel, l'origin interne peut differer du domaine public.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const redirectBase = isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`;

  return NextResponse.redirect(`${redirectBase}${next}`);
}
