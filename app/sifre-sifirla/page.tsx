import { Metadata } from "next";
import ResetPassword from "@/components/Pages/ResetPassword";

export const metadata: Metadata = {
  title: "Şifre Sıfırla",
  description: "Hesabınız için yeni bir şifre belirleyin.",
  robots: "noindex, nofollow",
};

export default function ResetPasswordRoute() {
  return <ResetPassword />;
}
