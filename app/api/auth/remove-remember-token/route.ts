import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Token'ı sil
    const deletedToken = await prisma.rememberToken.deleteMany({
      where: { token },
    });

    if (deletedToken.count === 0) {
      return NextResponse.json(
        { success: false, error: "Token bulunamadı" } as AuthResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Remember token silindi",
    } as AuthResponse);
  } catch (error) {
    console.error("Remove remember token error:", error);
    return NextResponse.json(
      { success: false, error: "Token silme hatası" } as AuthResponse,
      { status: 500 }
    );
  }
}
