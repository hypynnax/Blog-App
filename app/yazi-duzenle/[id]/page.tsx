import { Metadata } from "next";
import EditPostPage from "@/components/Pages/EditPost";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return {
    title: `Yazıyı Düzenle`,
    description: "Blog yazınızı düzenleyin ve güncelleyin.",
    robots: "noindex, nofollow",
  };
}

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditPostPage postId={id} />;
}
