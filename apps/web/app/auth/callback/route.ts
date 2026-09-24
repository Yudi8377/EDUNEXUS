import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(url.searchParams.get("next"));

  const supabase = await createClient();
  let error: { message: string } | null = null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = result.error;
  } else {
    return NextResponse.redirect(new URL("/auth/auth-code-error", url.origin));
  }

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
