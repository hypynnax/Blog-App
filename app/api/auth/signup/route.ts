import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { SignUpData, AuthResponse } from "@/types/auth";
import { isUsernameAvailable, isEmailAvailable } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);

    const { email, password, username, name, surname, phone }: SignUpData =
      await request.json();

    // Validation
    if (!email || !password || !username || !name || !surname) {
      return NextResponse.json(
        { success: false, error: "Tüm alanlar zorunludur" } as AuthResponse,
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

    // Password kontrolü (minimum 6 karakter)
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre en az 6 karakter olmalı",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Username kontrolü
    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı adı en az 3 karakter olmalı",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Username formatı (sadece alfanumerik ve alt çizgi)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Email ve username unique kontrolü
    const [isEmailUnique, isUsernameUnique] = await Promise.all([
      isEmailAvailable(email),
      isUsernameAvailable(username),
    ]);

    if (!isEmailUnique) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu email adresi zaten kullanımda",
        } as AuthResponse,
        { status: 409 }
      );
    }

    if (!isUsernameUnique) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu kullanıcı adı zaten kullanımda",
        } as AuthResponse,
        { status: 409 }
      );
    }

    // Supabase'de kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          name,
          surname,
          phone,
        },
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json(
        {
          success: false,
          error: "Kayıt sırasında bir hata oluştu: " + authError.message,
        } as AuthResponse,
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı oluşturulamadı" } as AuthResponse,
        { status: 400 }
      );
    }

    // Database'e kullanıcıyı kaydet
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: authData.user.email!,
        username,
        name,
        surname,
        phone,
        emailVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Kayıt başarılı! Email adresinizi onaylamak için gelen kutuyu kontrol edin.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          surname: user.surname,
          phone: user.phone,
        },
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası. Lütfen tekrar deneyin.",
      } as AuthResponse,
      { status: 500 }
    );
  }
}
