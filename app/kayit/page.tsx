import { Metadata } from "next";
import Register from "@/components/Pages/Register";

export const metadata: Metadata = {
  title: "Kayıt Sayfası",
  description: "Blog'a üye olun ve kendi yazılarınızı paylaşmaya başlayın.",
  robots: "noindex, nofollow",
};

export default function RegisterPage() {
  return <Register />;
}
