import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageClient } from "@/lib/supabase";
import { createAuthClientFromRequest } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    // Service key kontrolü
    let storageClient;
    try {
      storageClient = getStorageClient();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Storage not configured. Please contact administrator.",
        },
        { status: 500 }
      );
    }

    const supabase = createAuthClientFromRequest(request);

    // Auth kontrolü için normal client kullan
    const {
      data: { user: supabaseUser },
      error: userError,
    } = await supabase.auth.getUser();

    // Auth kontrolü
    if (userError || !supabaseUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const type = formData.get("type") as string;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    if (!type || !["profile", "background"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid image type" },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Dosya tipini kontrol et
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // Dosya uzantısını al
    const fileExtension = image.type.split("/")[1]?.toLowerCase() || "jpg";
    const fileName =
      type === "profile"
        ? `profile_image.${fileExtension}`
        : `bg_image.${fileExtension}`;
    const filePath = `users/${supabaseUser.id}/${fileName}`;

    // Dosyayı ArrayBuffer'a çevir
    const arrayBuffer = await image.arrayBuffer();

    // Storage işlemleri için Admin client kullan
    const { data: buckets, error: bucketError } =
      await storageClient.storage.listBuckets();

    if (bucketError) {
      return NextResponse.json(
        { success: false, error: "Storage not configured properly" },
        { status: 500 }
      );
    }

    const hasUserImagesBucket = buckets?.some(
      (bucket) => bucket.name === "user-images"
    );
    if (!hasUserImagesBucket) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Storage bucket 'user-images' not found. Please create it in Supabase dashboard.",
        },
        { status: 500 }
      );
    }

    // Eski dosyaları sil (aynı tip tüm uzantıları)
    try {
      const { data: existingFiles } = await storageClient.storage
        .from("user-images")
        .list(`users/${supabaseUser.id}`);

      if (existingFiles && existingFiles.length > 0) {
        const prefix = type === "profile" ? "profile_image" : "bg_image";
        const filesToDelete = existingFiles
          .filter((file) => file.name.startsWith(prefix))
          .map((file) => `users/${supabaseUser.id}/${file.name}`);

        if (filesToDelete.length > 0) {
          await storageClient.storage.from("user-images").remove(filesToDelete);
        }
      }
    } catch (removeErr) {}

    // Supabase'e yükle - Admin client ile
    const { data: uploadData, error: uploadError } = await storageClient.storage
      .from("user-images")
      .upload(filePath, arrayBuffer, {
        contentType: image.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to upload image",
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    // Public URL'i al - Admin client ile
    const {
      data: { publicUrl },
    } = storageClient.storage.from("user-images").getPublicUrl(filePath);

    // Veritabanında kullanıcı bilgilerini güncelle
    const updateData =
      type === "profile" ? { avatar: publicUrl } : { bgImage: publicUrl };

    const updatedUser = await prisma.user.update({
      where: { id: supabaseUser.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      message: `${
        type === "profile" ? "Profile" : "Background"
      } image uploaded successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
