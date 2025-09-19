"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Base/Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Bu sayfalarda navbar gösterme
  const hideNavbarPaths = [
    "/giris",
    "/kayit",
    "/sifremi-unuttum",
    "/sifre-sifirla",
  ];

  if (hideNavbarPaths.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
