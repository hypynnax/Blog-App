import { Metadata } from "next";
import UserPosts from "@/components/Pages/UserPosts";

export const metadata: Metadata = {
  title: "Yazılarım",
  description: "Tüm yazılarınızı görüntüleyin ve yönetin.",
  robots: "noindex, nofollow",
};

export default function UserPostsPage() {
  return <UserPosts />;
}
