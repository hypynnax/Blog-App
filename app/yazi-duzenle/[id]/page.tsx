import { Metadata } from "next";
import EditPostPage from "@/components/Pages/EditPost";

interface EditPostProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: EditPostProps): Promise<Metadata> {
  return {
    title: `Yazıyı Düzenle`,
    description: "Blog yazınızı düzenleyin ve güncelleyin.",
    robots: "noindex, nofollow",
  };
}

export default function EditPost({ params }: EditPostProps) {
  return <EditPostPage postId={params.id} />;
}
