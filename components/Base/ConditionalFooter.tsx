"use client";
import { usePathname } from "next/navigation";
import Footer from "@/components/Base/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Bu sayfalarda footer gösterme
  const hideFooterPaths = [
    "/giris",
    "/kayit",
    "/sifremi-unuttum",
    "/sifre-sifirla",
  ];

  if (hideFooterPaths.includes(pathname)) {
    return null;
  }

  return <Footer />;
}
