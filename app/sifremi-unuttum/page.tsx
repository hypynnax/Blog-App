import { Metadata } from "next";
import ForgotPasswordPage from "@/components/Pages/ForgotPassword";

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  description:
    "Şifrenizi mi unuttunuz? Email adresinizi girerek şifre sıfırlama linki alın.",
  robots: "noindex, nofollow",
};

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
