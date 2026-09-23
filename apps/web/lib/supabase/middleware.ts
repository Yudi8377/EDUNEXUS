import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseKey) {
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  const protectedPath =
    request.nextUrl.pathname.startsWith("/students") ||
    request.nextUrl.pathname.startsWith("/safety") ||
    request.nextUrl.pathname.startsWith("/ai-control") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/teacher") ||
    request.nextUrl.pathname.startsWith("/tenant") ||
    request.nextUrl.pathname.startsWith("/schools") ||
    request.nextUrl.pathname.startsWith("/attendance") ||
    request.nextUrl.pathname.startsWith("/learning") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  if (!data?.claims && protectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
