import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category") || "all";

    const where: any = {
      status: "PUBLISHED",
    };

    if (category !== "all") {
      where.category = category;
    }

    if (query && query.trim() !== "") {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
