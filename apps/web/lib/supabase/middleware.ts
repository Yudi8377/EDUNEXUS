import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );

          if (headers) {
            for (const [name, value] of headers.entries()) {
              response.headers.set(name, value);
            }
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  const protectedPath =
    request.nextUrl.pathname.startsWith("/students") ||
    request.nextUrl.pathname.startsWith("/safety") ||
    request.nextUrl.pathname.startsWith("/ai-control") ||
    request.nextUrl.pathname.startsWith("/reports");

  if (!data?.claims && protectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
