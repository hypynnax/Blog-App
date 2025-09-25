"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { emailIcon } from "@/icons/icon";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email adresi gerekli");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Geçerli bir email adresi girin");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailSent(true);
        toast.success("Şifre sıfırlama linki gönderildi!");
      } else {
        toast.error(data.error || "Bir hata oluştu");
      }
    } catch (error) {
      toast.error("Bağlantı hatası oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 text-center space-y-6">
          <div className="text-6xl mb-4">📧</div>

          <h2 className="text-2xl font-bold text-gray-800">Email Gönderildi</h2>

          <div className="space-y-4 text-gray-600">
            <p>
              <strong>{email}</strong> adresine şifre sıfırlama linki
              gönderildi.
            </p>
            <p className="text-sm">
              Email&apos;i görmüyorsanız spam klasörünüzü kontrol edin.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Farklı Email Dene
            </button>

            <Link
              href="/giris"
              className="block w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-center"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Şifremi Unuttum
          </h2>
          <p className="text-gray-600 text-sm">
            Email adresinizi girin, size şifre sıfırlama linki gönderelim.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-md mb-2 font-bold text-gray-700">
              Email Adresi
            </label>
            <div className="mt-1 w-full flex justify-start items-center gap-2 px-4 py-2 border rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
              {emailIcon}
              <input
                type="email"
                required
                className="w-full p-1 outline-none"
                value={email}
                placeholder="E-posta adresinizi girin"
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kayıt olurken kullandığınız email adresini girin
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
          </button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Şifrenizi hatırladınız mı?{" "}
            <Link
              href="/giris"
              className="text-blue-600 hover:underline font-medium"
            >
              Giriş Yap
            </Link>
          </p>

          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{" "}
            <Link
              href="/kayit"
              className="text-blue-600 hover:underline font-medium"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
