import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  let response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Çıkış sırasında bir hata oluştu",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Success response'u cookies ile birlikte return et
    return NextResponse.json(
      {
        success: true,
        message: "Başarıyla çıkış yapıldı",
      } as AuthResponse,
      {
        status: 200,
        headers: response.headers, // Cookies'leri dahil et
      }
    );
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
