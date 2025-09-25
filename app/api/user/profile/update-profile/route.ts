import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthResponse } from "@/types/auth";
import {
  createAuthClientFromRequest,
  isUsernameAvailable,
} from "@/lib/auth-utils";

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);

    // Kullanıcının oturum açmış olduğunu kontrol et
    const {
      data: { user: supabaseUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !supabaseUser) {
      return NextResponse.json(
        { success: false, error: "Oturum geçersiz" } as AuthResponse,
        { status: 401 }
      );
    }

    const { username, name, surname, phone, bio, website, location } =
      await request.json();

    // Validation
    if (!username || !name || !surname) {
      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı adı, isim ve soyisim zorunlu",
        } as AuthResponse,
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Kullanıcı adı en az 3 karakter olmalı",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Username formatı kontrolü
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

    // Username unique kontrolü (mevcut kullanıcı hariç)
    const isUsernameUnique = await isUsernameAvailable(
      username,
      supabaseUser.id
    );
    if (!isUsernameUnique) {
      return NextResponse.json(
        {
          success: false,
          error: "Bu kullanıcı adı zaten kullanımda",
        } as AuthResponse,
        { status: 409 }
      );
    }

    // Website URL kontrolü
    if (website && website.length > 0) {
      try {
        new URL(website);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: "Geçersiz website URL formatı",
          } as AuthResponse,
          { status: 400 }
        );
      }
    }

    // Bio uzunluk kontrolü
    if (bio && bio.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: "Biyografi en fazla 500 karakter olabilir",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Kullanıcı profilini güncelle
    const updatedUser = await prisma.user.update({
      where: { id: supabaseUser.id },
      data: {
        username: username.trim(),
        name: name.trim(),
        surname: surname.trim(),
        phone: phone?.trim() || null,
        bio: bio?.trim() || null,
        website: website?.trim() || null,
        location: location?.trim() || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        surname: true,
        phone: true,
        bio: true,
        website: true,
        location: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil başarıyla güncellendi",
      data: {
        user: {
          ...updatedUser,
          email: supabaseUser.email,
        },
      },
    } as AuthResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Profil güncellenirken hata oluştu",
      } as AuthResponse,
      { status: 500 }
    );
  }
}
