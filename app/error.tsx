"use client";
import Link from "next/link";
import { errorIcon } from "@/icons/icon";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/70 border rounded-md shadow-md p-8">
          <div className="text-6xl mb-4 flex justify-center items-center">
            {errorIcon}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Bir Hata Oluştu
          </h1>
          <p className="text-gray-600 mb-6">
            Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
          </p>

          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition cursor-pointer"
            >
              Tekrar Dene
            </button>
            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
