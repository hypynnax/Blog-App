import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Id ile kullanıcının tüm yorumlarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Önce kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          authorId: user.id,
        },
        include: {
          author: {
            select: { name: true, surname: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: {
          authorId: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        comments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("User comments fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
