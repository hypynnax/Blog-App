import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parametreleri
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    // Blog yazılarını getir
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          category: { equals: params.slug, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          author: {
            select: { username: true },
          },
          createdAt: true,
          category: true,
          tags: true,
          status: true,
          coverImage: true,
          readTime: true,
          viewCount: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      // Toplam yazı sayısı
      prisma.post.count({
        where: {
          status: "PUBLISHED",
          category: {
            equals: params.slug,
            mode: "insensitive",
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      posts: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get category posts error:", error);
    return NextResponse.json(
      { error: "Kategori yazıları getirilirken hata oluştu" },
      { status: 500 }
    );
  }
}
