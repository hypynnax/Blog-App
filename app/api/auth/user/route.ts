import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { AuthResponse } from "@/types/auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json(
        { success: false, error: "Oturum bulunamadı" } as AuthResponse,
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" } as AuthResponse,
        { status: 404 }
      );
    }

    const totalViews = await prisma.post.aggregate({
      where: { authorId: user.id },
      _sum: { viewCount: true },
    });

    const userWithViews = {
      ...user,
      _count: {
        ...user._count,
        views: totalViews._sum.viewCount || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userWithViews,
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Sunucu hatası. Lütfen tekrar deneyin.",
      } as AuthResponse,
      { status: 500 }
    );
  }
}
