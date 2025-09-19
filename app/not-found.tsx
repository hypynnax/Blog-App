import { Metadata } from "next";
import Link from "next/link";
import { notFoundIcon } from "@/icons/icon";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
  description: "Aradığınız sayfa bulunamadı.",
  robots: "noindex, nofollow",
};

export default function NotFound() {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-2 text-white p-2">
      <h1 className="text-5xl font-bold">HATA</h1>
      <h1 className="text-9xl md:text-[200px] lg:text-[300px] font-bold text-blue-400 flex justify-center items-center">
        4 <span>{notFoundIcon}</span> 4
      </h1>
      <p className="text-xl font-bold text-center">
        Görünüşe göre aradığınız sayfayı bulamadık!
      </p>
      <Link
        href={"/"}
        className="border px-4 py-2 mt-4 rounded-full cursor-pointer"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
