import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase";
import { createProxySupabase } from "@/lib/supabase-proxy";

export async function proxy(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return redirectToLogin(request);
  }

  const { supabase, getResponse } = createProxySupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin(request);
  }

  return getResponse();
}

// Redirige les visiteurs non connectes vers la page de connexion.
function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
