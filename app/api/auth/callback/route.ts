import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/sifre-sifirla";

  console.log("Auth callback params:", { token_hash, type, next });

  if (token_hash && type) {
    const supabase = createAuthClientFromRequest(request);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });

      console.log("Verify OTP result:", { data: !!data.session, error });

      if (error) {
        console.error("Auth verification error:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/sifremi-unuttum?error=invalid_token`
        );
      }

      if (data.session) {
        console.log("Session created successfully");
        return NextResponse.redirect(`${requestUrl.origin}${next}`);
      }
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        `${requestUrl.origin}/sifremi-unuttum?error=callback_error`
      );
    }
  }

  // Fallback - token yoksa veya geçersizse
  console.log("No valid token, redirecting to reset request");
  return NextResponse.redirect(
    `${requestUrl.origin}/sifremi-unuttum?error=no_token`
  );
}
