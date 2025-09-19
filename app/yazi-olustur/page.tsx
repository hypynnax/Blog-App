import { Metadata } from "next";
import CreatePostPage from "@/components/Pages/CreatePost";

export const metadata: Metadata = {
  title: "Yeni Yazı Oluştur",
  description: "Yeni bir blog yazısı oluşturun ve paylaşın.",
  robots: "noindex, nofollow",
};

export default function CreatePost() {
  return <CreatePostPage />;
}
