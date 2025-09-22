import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";
import { getStorageClient } from "@/lib/supabase";
import { AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  let response = NextResponse.json({ success: false });

  // Cookie set edebilen client oluştur
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
    const { token }: { token: string } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token gerekli" } as AuthResponse,
        { status: 400 }
      );
    }

    // Token'ı database'de kontrol et
    const rememberToken = await prisma.rememberToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    if (!rememberToken) {
      return NextResponse.json(
        { success: false, error: "Geçersiz token" } as AuthResponse,
        { status: 401 }
      );
    }

    // Token süresi kontrol et
    if (rememberToken.expiresAt < new Date()) {
      // Süresi dolmuş token'ı sil
      await prisma.rememberToken.delete({
        where: { id: rememberToken.id },
      });

      return NextResponse.json(
        { success: false, error: "Token süresi dolmuş" } as AuthResponse,
        { status: 401 }
      );
    }

    // Admin client ile kullanıcı bilgilerini al
    const supabaseAdmin = getStorageClient();
    const { data: supabaseUser, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(rememberToken.userId);

    if (userError || !supabaseUser.user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" } as AuthResponse,
        { status: 404 }
      );
    }

    // Magic link ile session oluştur
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: supabaseUser.user.email!,
      });

    if (sessionError || !sessionData.properties?.action_link) {
      console.error("Session generation error:", sessionError);
      return NextResponse.json(
        { success: false, error: "Session oluşturulamadı" } as AuthResponse,
        { status: 500 }
      );
    }

    // Magic link'ten session parametrelerini çıkar
    const magicUrl = new URL(sessionData.properties.action_link);
    const hashParams = new URLSearchParams(magicUrl.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // Session'ı set et
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (setSessionError) {
        console.error("Set session error:", setSessionError);
      }
    }

    // Token'ın son kullanım tarihini güncelle
    await prisma.rememberToken.update({
      where: { id: rememberToken.id },
      data: { createdAt: new Date() },
    });

    // Success response'u cookies ile birlikte return et
    return NextResponse.json(
      {
        success: true,
        message: "Token geçerli - otomatik giriş yapıldı",
        data: {
          user: {
            id: rememberToken.user.id,
            email: supabaseUser.user.email,
            username: rememberToken.user.username,
            name: rememberToken.user.name,
            surname: rememberToken.user.surname,
            role: rememberToken.user.role,
            emailVerified: rememberToken.user.emailVerified,
          },
        },
      } as AuthResponse,
      {
        status: 200,
        headers: response.headers, // Cookies'leri dahil et
      }
    );
  } catch (error) {
    console.error("Check remember token error:", error);
    return NextResponse.json(
      { success: false, error: "Token kontrol hatası" } as AuthResponse,
      { status: 500 }
    );
  }
}
