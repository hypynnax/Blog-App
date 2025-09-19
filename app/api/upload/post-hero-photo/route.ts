import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Dosya türü kontrolü
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Dosya boyutu kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const fileName = `${session.user.id}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file);

    if (error) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-images").getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
