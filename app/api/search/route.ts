import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all"; // posts, users, all

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const results: any = {};

    if (type === "posts" || type === "all") {
      results.posts = await prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { tags: { has: query } },
          ],
        },
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
      });
    }

    if (type === "users" || type === "all") {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { surname: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          avatar: true,
          bio: true,
        },
        take: 10,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
