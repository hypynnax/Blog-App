"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { hiddenPasswordIcon, showPasswordIcon } from "@/icons/icon";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    surname: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Telefon numarasını formatla
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Sadece rakamları al

    // Türkiye telefon formatı: (5XX) XXX XX XX
    if (value.length <= 3) {
      value = value.replace(/(\d{1,3})/, "($1");
    } else if (value.length <= 6) {
      value = value.replace(/(\d{3})(\d{1,3})/, "($1) $2");
    } else if (value.length <= 8) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,2})/, "($1) $2 $3");
    } else if (value.length <= 10) {
      value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{1,2})/, "($1) $2 $3 $4");
    } else {
      // Maksimum 10 haneli numara
      value = value.slice(0, 10);
      value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "($1) $2 $3 $4");
    }

    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.username.trim()) {
      toast.error("Kullanıcı adı gerekli!");
      return;
    }

    if (formData.username.length < 3) {
      toast.error("Kullanıcı adı en az 3 karakter olmalı!");
      return;
    }

    // ⚠️ EKLENDİ: Username format kontrolü
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error("Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir!");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error("Şifreler uyuşmuyor!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalı!");
      return;
    }

    if (!formData.name.trim() || !formData.surname.trim()) {
      toast.error("İsim ve soyisim gerekli!");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Geçerli bir email adresi girin!");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp({
        ...formData,
        username: formData.username.trim().toLowerCase(),
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
      });

      if (result.success) {
        toast.success("Kayıt başarılı!");
        router.push("/giris");
      } else {
        toast.error(result.error || "Kayıt başarısız");
      }
    } catch (error) {
      toast.error("Kayıt sırasında beklenmeyen bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">Kayıt Ol</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username - ⚠️ İYİLEŞTİRİLDİ */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Kullanıcı Adı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                @
              </span>
              <input
                type="text"
                name="username"
                required
                className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="kullaniciadi"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                title="Sadece harf, rakam ve alt çizgi kullanabilirsiniz"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sadece harf, rakam ve alt çizgi kullanın
            </p>
          </div>

          {/* İsim ve Soyisim */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                İsim <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="İsminizi girin"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Soyisim <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="surname"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Soyisminizi girin"
                value={formData.surname}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={50}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E-posta adresinizi girin"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Telefon <span className="text-gray-500">(İsteğe bağlı)</span>
            </label>
            <input
              type="text"
              name="phone"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(5XX) XXX XX XX"
              value={formData.phone}
              onChange={handlePhoneChange}
              disabled={isLoading}
              maxLength={15}
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Şifre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Şifrenizi girin"
                minLength={6}
                maxLength={100}
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 focus:outline-none cursor-pointer"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? hiddenPasswordIcon : showPasswordIcon}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              En az 6 karakter olmalı
            </p>
          </div>

          {/* Şifre Doğrulama */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Şifre Tekrar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="passwordConfirm"
                required
                className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Şifrenizi tekrar girin"
                minLength={6}
                maxLength={100}
                value={formData.passwordConfirm}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 focus:outline-none cursor-pointer"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? hiddenPasswordIcon : showPasswordIcon}
              </button>
            </div>

            {/* ⚠️ EKLENDİ: Şifre eşleşme göstergesi */}
            {formData.password && formData.passwordConfirm && (
              <div
                className={`text-xs mt-1 px-2 py-1 rounded ${
                  formData.password === formData.passwordConfirm
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }`}
              >
                {formData.password === formData.passwordConfirm
                  ? "✓ Şifreler eşleşiyor"
                  : "✗ Şifreler eşleşmiyor"}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isLoading || formData.password !== formData.passwordConfirm
            }
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="text-blue-600 hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
