import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorageClient } from "@/lib/supabase";
import { createAuthClientFromRequest } from "@/lib/auth-utils";

export async function DELETE(request: NextRequest) {
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

    // Auth kontrolü
    const {
      data: { user: supabaseUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !supabaseUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type } = await request.json();

    if (!type || !["profile", "background"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid image type" },
        { status: 400 }
      );
    }

    // Kullanıcının tüm dosyalarını listele
    const { data: existingFiles } = await storageClient.storage
      .from("user-images")
      .list(`users/${supabaseUser.id}`);

    if (existingFiles && existingFiles.length > 0) {
      // İlgili tip dosyalarını bul ve sil
      const prefix = type === "profile" ? "profile_image" : "bg_image";
      const filesToDelete = existingFiles
        .filter((file) => file.name.startsWith(prefix))
        .map((file) => `users/${supabaseUser.id}/${file.name}`);

      if (filesToDelete.length > 0) {
        // Storage client ile sil
        const { error } = await storageClient.storage
          .from("user-images")
          .remove(filesToDelete);

        if (error) {
          if (!error.message.includes("not found")) {
            return NextResponse.json(
              { success: false, error: "Failed to delete image" },
              { status: 500 }
            );
          }
        }
      }
    }

    // Veritabanında kullanıcı bilgilerini güncelle (null yap)
    const updateData =
      type === "profile" ? { avatar: null } : { bgImage: null };

    await prisma.user.update({
      where: { id: supabaseUser.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `${
        type === "profile" ? "Profile" : "Background"
      } image deleted successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
