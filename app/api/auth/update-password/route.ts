import { NextRequest, NextResponse } from "next/server";
import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);

    const {
      password,
      passwordConfirm,
      code,
    }: {
      password: string;
      passwordConfirm?: string;
      code: string;
    } = await request.json();

    // Validation
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Yeni şifre gerekli" } as AuthResponse,
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre en az 6 karakter olmalı",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Şifre güvenlik kontrolü (opsiyonel)
    if (password.length > 128) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre çok uzun (maksimum 128 karakter)",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Şifre onayı kontrolü (eğer gönderilmişse)
    if (passwordConfirm !== undefined && password !== passwordConfirm) {
      return NextResponse.json(
        { success: false, error: "Şifreler eşleşmiyor" } as AuthResponse,
        { status: 400 }
      );
    }

    // Kullanıcının oturum açmış olduğunu kontrol et
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (userError) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Oturum doğrulanamadı: " + (userError.message || "Bilinmeyen hata"),
        } as AuthResponse,
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Geçersiz oturum veya süresi dolmuş token. Lütfen şifre sıfırlama bağlantısını tekrar kullanın.",
        } as AuthResponse,
        { status: 401 }
      );
    }

    // Şifreyi güncelle
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      // Hata türüne göre mesaj ver
      let errorMessage = "Şifre güncellenemedi";

      if (updateError.message?.includes("same_password")) {
        errorMessage = "Yeni şifre eski şifre ile aynı olamaz";
      } else if (updateError.message?.includes("weak_password")) {
        errorMessage = "Şifre çok zayıf, daha güçlü bir şifre seçin";
      } else if (updateError.message?.includes("session_not_found")) {
        errorMessage =
          "Oturum bulunamadı. Lütfen şifre sıfırlama işlemini tekrar başlatın";
      } else if (updateError.message) {
        errorMessage = updateError.message;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        } as AuthResponse,
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Şifre başarıyla güncellendi",
      data: {
        userId: user.id,
        email: user.email,
        updatedAt: new Date().toISOString(),
      },
    } as AuthResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası. Lütfen tekrar deneyin.",
      } as AuthResponse,
      { status: 500 }
    );
  }
}
