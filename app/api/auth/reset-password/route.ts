import { NextRequest, NextResponse } from "next/server";
import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { ResetPasswordData, AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);

    const { email }: ResetPasswordData = await request.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email adresi gerekli" } as AuthResponse,
        { status: 400 }
      );
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz email formatı" } as AuthResponse,
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/sifre-sifirla`,
    });

    if (error) {
      console.error("Reset password error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Şifre sıfırlama linki gönderilemedi",
        } as AuthResponse,
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Şifre sıfırlama linki email adresinize gönderildi",
    } as AuthResponse);
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası. Lütfen tekrar deneyin.",
      } as AuthResponse,
      { status: 500 }
    );
  }
}
