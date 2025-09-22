import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuthClientFromRequest } from "@/lib/auth-utils";
import { AuthResponse } from "@/types/auth";

// POST - Yeni post oluştur
export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);

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

    const body = await request.json();
    const { title, content, excerpt, category, tags, coverImage, status } =
      body;

    // Slug oluştur
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Slug benzersiz mi kontrol et
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Okuma süresini hesapla (yaklaşık)
    const readTime = Math.ceil(content.split(" ").length / 200);

    const post = await prisma.post.create({
      data: {
        title,
        slug: uniqueSlug,
        content,
        excerpt,
        category,
        tags,
        coverImage,
        readTime,
        status: status || "DRAFT",
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: supabaseUser.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
