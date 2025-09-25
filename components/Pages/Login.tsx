"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { emailIcon, passwordIcon } from "@/icons/icon";

export default function Login() {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [checkingRemembered, setCheckingRemembered] = useState(true);

  const { signIn, user, loading, checkRememberedUser } = useAuth();
  const router = useRouter();

  // Component mount olduğunda remember me kontrol et
  useEffect(() => {
    const checkRemembered = async () => {
      if (!loading && !user) {
        const remembered = await checkRememberedUser();
        if (remembered) {
          toast.success("Otomatik giriş yapıldı!");
          router.push("/dashboard");
        }
      }
      setCheckingRemembered(false);
    };

    checkRemembered();
  }, [loading, user, checkRememberedUser, router]);

  // Eğer kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.emailOrUsername.trim()) {
      toast.error("Email veya kullanıcı adı gerekli!");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("Şifre gerekli!");
      return;
    }

    // Email veya username validation (daha esnek)
    if (formData.emailOrUsername.includes("@")) {
      // Email formatı kontrolü
      if (!formData.emailOrUsername.includes(".")) {
        toast.error("Geçerli bir email adresi girin!");
        return;
      }
    } else {
      // Username formatı kontrolü
      if (formData.emailOrUsername.length < 3) {
        toast.error("Kullanıcı adı en az 3 karakter olmalı!");
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await signIn(
        {
          emailOrUsername: formData.emailOrUsername.trim(),
          password: formData.password,
        },
        rememberMe
      );

      if (result.success) {
        toast.success("Giriş başarılı!");
        if (rememberMe) {
          toast.success("Bir dahaki sefere otomatik giriş yapılacak!", {
            duration: 3000,
          });
        }
      } else {
        toast.error(result.error || "Giriş başarısız");
      }
    } catch (error) {
      toast.error("Giriş sırasında beklenmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || checkingRemembered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {checkingRemembered
              ? "Otomatik giriş kontrol ediliyor..."
              : "Yükleniyor..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">Giriş Yap</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-md mb-2 font-bold">
              Email veya Kullanıcı Adı
            </label>
            <div className="mt-1 w-full flex justify-start items-center gap-2 px-4 py-2 border rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
              {emailIcon}
              <input
                type="text"
                name="emailOrUsername"
                required
                className="w-full p-1 outline-none"
                value={formData.emailOrUsername}
                placeholder="Email veya kullanıcı adınızı girin"
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email adresiniz veya kullanıcı adınızla giriş yapabilirsiniz
            </p>
          </div>

          <div>
            <label className="block text-md mb-2 font-bold">Şifre</label>
            <div className="mt-1 w-full flex justify-start items-center gap-2 px-4 py-2 border rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
              {passwordIcon}
              <input
                type="password"
                name="password"
                required
                className="w-full p-1 outline-none"
                value={formData.password}
                placeholder="Şifrenizi girin"
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex justify-center items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="cursor-pointer text-sm">
                Beni Hatırla
              </label>
            </div>

            <Link
              href="/sifremi-unuttum"
              className="font-medium text-blue-500 hover:text-blue-600 cursor-pointer transition text-sm"
            >
              Şifremi Unuttum
            </Link>
          </div>

          {rememberMe && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-700">
                ℹ️ &#34;Beni Hatırla&#34; seçeneği aktif. Bu cihazda 30 gün
                boyunca otomatik giriş yapılacak.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="text-blue-600 hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
