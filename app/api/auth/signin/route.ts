import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { SignInData, AuthResponse } from "@/types/auth";
import { findUserByEmailOrUsername } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient(cookieStore);

    const { emailOrUsername, password }: SignInData = await request.json();

    // Validation
    if (!emailOrUsername || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email/Kullanıcı adı ve şifre gerekli",
        } as AuthResponse,
        { status: 400 }
      );
    }

    // Database'den kullanıcıyı bul
    const user = await findUserByEmailOrUsername(emailOrUsername);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" } as AuthResponse,
        { status: 404 }
      );
    }

    // Supabase ile giriş yap (email ile)
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

    if (authError) {
      console.error("Supabase auth error:", authError);

      // Hata mesajlarını kullanıcı dostu hale getir
      let errorMessage = "Giriş sırasında bir hata oluştu";

      if (authError.message.includes("Invalid login credentials")) {
        errorMessage = "Email/şifre yanlış";
      } else if (authError.message.includes("Email not confirmed")) {
        errorMessage = "Email adresinizi henüz onaylamadınız";
      }

      return NextResponse.json(
        { success: false, error: errorMessage } as AuthResponse,
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: "Giriş yapılamadı" } as AuthResponse,
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Giriş başarılı!",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          surname: user.surname,
          role: user.role,
        },
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası. Lütfen tekrar deneyin.",
      } as AuthResponse,
      { status: 500 }
    );
  }
}
