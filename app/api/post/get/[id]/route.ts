import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRouteHandlerClient } from "@/lib/supabase";
import { AuthResponse } from "@/types/auth";
import { cookies } from "next/headers";

// GET - Id ile post getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient(cookieStore);

    const {
      data: { user: supabaseUser },
      error: userError,
    } = await supabase.auth.getUser();

    const post = await prisma.post.findUnique({
      where: { id: id },
      include: {
        author: {
          select: { username: true, avatar: true, name: true, surname: true },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId && supabaseUser && post.authorId !== supabaseUser.id) {
      await prisma.post.update({
        where: { id: id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT - Id ile yeni post oluştur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient(cookieStore);

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

    const existingPost = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== supabaseUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const post = await prisma.post.update({
      where: { id: id },
      data: {
        title,
        slug: uniqueSlug,
        content,
        excerpt,
        category,
        tags,
        coverImage,
        readTime,
        status: status,
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

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post create error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
