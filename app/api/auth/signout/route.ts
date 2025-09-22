import { NextRequest, NextResponse } from "next/server";
import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Signout error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Çıkış sırasında bir hata oluştu",
        } as AuthResponse,
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Başarıyla çıkış yapıldı",
    } as AuthResponse);
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası. Lütfen tekrar deneyin.",
      } as AuthResponse,
      { status: 500 }
    );
  }
}
