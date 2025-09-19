import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Tüm kategoriler
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Yeni kategori (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Admin check logic here
    const body = await request.json();
    const { name, description, color } = body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
