import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthResponse } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const { userId, token }: { userId: string; token: string } =
      await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { success: false, error: "User ID ve token gerekli" } as AuthResponse,
        { status: 400 }
      );
    }

    // Eski token'ları temizle (kullanıcı başına max 3 token)
    await prisma.rememberToken.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Kullanıcının mevcut token sayısını kontrol et
    const existingTokens = await prisma.rememberToken.count({
      where: { userId },
    });

    // En eski token'ı sil (max 3 token)
    if (existingTokens >= 3) {
      const oldestToken = await prisma.rememberToken.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });

      if (oldestToken) {
        await prisma.rememberToken.delete({
          where: { id: oldestToken.id },
        });
      }
    }

    // Yeni token'ı kaydet (30 gün geçerli)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const rememberToken = await prisma.rememberToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Remember token kaydedildi",
      data: {
        tokenId: rememberToken.id,
        expiresAt: rememberToken.expiresAt,
      },
    } as AuthResponse);
  } catch (error) {
    console.error("Save remember token error:", error);
    return NextResponse.json(
      { success: false, error: "Token kaydetme hatası" } as AuthResponse,
      { status: 500 }
    );
  }
}
