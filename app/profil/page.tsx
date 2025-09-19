import { Metadata } from "next";
import ProfilePage from "@/components/Pages/Profile";

export const metadata: Metadata = {
  title: "Profil",
  description: "Profil bilgilerinizi güncelleyin ve yazılarınızı yönetin.",
  robots: "noindex, nofollow",
};

export default function Profile() {
  return <ProfilePage />;
}
