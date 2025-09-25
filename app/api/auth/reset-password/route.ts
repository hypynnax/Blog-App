import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email adresi gerekli" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz email formatı" },
        { status: 400 }
      );
    }

    // Callback URL'yi kullan
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/auth/callback?next=/sifre-sifirla`,
    });

    if (error) {
      console.error("Reset password error:", error);
      return NextResponse.json(
        { success: false, error: "Şifre sıfırlama linki gönderilemedi" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Şifre sıfırlama linki email adresinize gönderildi",
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
