import { Metadata } from "next";
import Login from "@/components/Pages/Login";

export const metadata: Metadata = {
  title: "Giriş Sayfası",
  description: "Blog hesabınıza giriş yapın ve yazı yazmaya başlayın.",
  robots: "noindex, nofollow",
};

export default function LoginPage() {
  return <Login />;
}
