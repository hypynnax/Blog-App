import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
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

    // Supabase'den kullanıcı bilgisini al ve session oluştur
    const supabase = createAuthClientFromRequest(request);

    // Admin client ile kullanıcı bilgilerini al (email için)
    const { data: supabaseUser, error: userError } =
      await supabase.auth.admin.getUserById(rememberToken.userId);

    if (userError || !supabaseUser.user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" } as AuthResponse,
        { status: 404 }
      );
    }

    // Session oluştur (güvenlik için yeni session token'ı oluştur)
    const { data: sessionData, error: sessionError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: supabaseUser.user.email!,
        options: {
          redirectTo: `${process.env.NEXTAUTH_URL}/dashboard`,
        },
      });

    if (sessionError) {
      console.error("Session generation error:", sessionError);
      return NextResponse.json(
        { success: false, error: "Session oluşturulamadı" } as AuthResponse,
        { status: 500 }
      );
    }

    // Token'ın son kullanım tarihini güncelle (activity tracking için)
    await prisma.rememberToken.update({
      where: { id: rememberToken.id },
      data: { createdAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Token geçerli",
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
        magicLink: sessionData.properties?.action_link, // Otomatik giriş için
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Check remember token error:", error);
    return NextResponse.json(
      { success: false, error: "Token kontrol hatası" } as AuthResponse,
      { status: 500 }
    );
  }
}
