"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";
import toast from "react-hot-toast";
import { hiddenPasswordIcon, showPasswordIcon } from "@/icons/icon";

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // URL parametrelerinden session bilgilerini al
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          toast.error("Oturum hatası");
        }

        supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            if (!session) {
              // Geçersiz session
              toast.error(
                "Geçersiz şifre sıfırlama linki. Lütfen yeni bir link isteyin."
              );
              router.push("/sifremi-unuttum");
              return;
            }
          }
        });
      } catch (error) {
        toast.error("Oturum kontrol edilemedi");
        router.push("/sifremi-unuttum");
      } finally {
        setCheckingSession(false);
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      toast.error("Şifreler uyuşmuyor!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        toast.success("Şifre başarıyla değiştirildi!");

        // Kullanıcıyı çıkış yaptır
        setTimeout(async () => {
          await supabase.auth.signOut();
        }, 2000);
      } else {
        toast.error(data.error || "Şifre sıfırlanırken hata oluştu");
      }
    } catch (error) {
      toast.error("Şifre güncellenirken bir hatası oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 text-center space-y-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">Geçersiz Link</h2>
          <p className="text-gray-600">
            Şifre sıfırlama linki geçersiz veya süresi dolmuş.
          </p>
          <Link
            href="/sifremi-unuttum"
            className="block w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition text-center"
          >
            Yeni Link İste
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 text-center space-y-6">
          <div className="text-6xl mb-4">✅</div>

          <h2 className="text-2xl font-bold text-gray-800">
            Şifre Değiştirildi
          </h2>

          <p className="text-gray-600">
            Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş
            yapabilirsiniz.
          </p>

          <Link
            href="/giris"
            className="block w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition text-center font-medium"
          >
            Giriş Yapmaya Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Yeni Şifre Belirle
          </h2>
          <p className="text-gray-600 text-sm">
            Hesabınız için yeni bir şifre oluşturun.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Yeni Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="Yeni şifrenizi girin"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? hiddenPasswordIcon : showPasswordIcon}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              En az 6 karakter olmalı
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Şifre Tekrar
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="passwordConfirm"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                placeholder="Şifrenizi tekrar girin"
                value={formData.passwordConfirm}
                onChange={handleChange}
                disabled={isLoading}
                minLength={6}
              />
            </div>
          </div>

          {/* Şifre Uyuşma Kontrolü Göstergesi */}
          {formData.password && formData.passwordConfirm && (
            <div
              className={`text-xs px-3 py-2 rounded ${
                formData.password === formData.passwordConfirm
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {formData.password === formData.passwordConfirm
                ? "✓ Şifreler uyuşuyor"
                : "✗ Şifreler uyuşmuyor"}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isLoading || formData.password !== formData.passwordConfirm
            }
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Şifre Değiştiriliyor..." : "Şifreyi Değiştir"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/giris" className="text-sm text-blue-600 hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
