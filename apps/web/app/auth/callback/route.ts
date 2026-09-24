import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", url.origin));
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const targetOrigin =
    process.env.NODE_ENV === "development"
      ? url.origin
      : forwardedHost
        ? `https://${forwardedHost}`
        : url.origin;

  return NextResponse.redirect(`${targetOrigin}${next}`);
}
