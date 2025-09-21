"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { searchBarIcon } from "@/icons/icon";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      setIsOpen(false); // Mobile menu'yu önce kapat
      await signOut();
      toast.success("Çıkış yapıldı");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Çıkış yapılırken hata oluştu");
    }
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  if (!mounted || loading) {
    return (
      <nav className="bg-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="animate-pulse flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="px-6 py-4 shadow-xl text-white shadow-gray-700">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-lg font-semibold">
          <Link
            href="/"
            className="hover:text-blue-600 transition"
            onClick={closeMobileMenu}
          >
            MY BLOG APP
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link href="/arama" className="hover:text-blue-600 transition">
            {searchBarIcon}
          </Link>
          <Link href="/" className="hover:text-blue-600 transition">
            Anasayfa
          </Link>
          <Link href="/hakkimizda" className="hover:text-blue-600 transition">
            Hakkımızda
          </Link>
          <Link href="/iletisim" className="hover:text-blue-600 transition">
            İletişim
          </Link>
          {user && (
            <Link href="/yazilarim" className="hover:text-blue-600 transition">
              Yazılarım
            </Link>
          )}
        </div>

        {/* Auth Links */}
        <div className="hidden lg:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-blue-100 text-sm">
                Hoşgeldin, {user.name}
              </span>
              <Link
                href="/dashboard"
                className="hover:text-blue-600 transition"
              >
                Dashboard
              </Link>
              <Link href="/profil" className="hover:text-blue-600 transition">
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition cursor-pointer"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" className="hover:text-blue-600 transition">
                Giriş Yap
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link
                href="/kayit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={`block w-5 h-0.5 bg-current transition-all ${
                isOpen ? "rotate-45 translate-y-1" : ""
              }`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-current mt-1 transition-all ${
                isOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-current mt-1 transition-all ${
                isOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden overflow-y-auto scrollbar-hide ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/arama"
                className="py-2 hover:text-blue-600 transition bg-white/60 flex justify-end rounded-full pr-2"
                onClick={closeMobileMenu}
              >
                {searchBarIcon}
              </Link>
              {user && (
                <>
                  {user.name && (
                    <div className="py-2 text-blue-100 text-sm border-b border-blue-400">
                      Hoşgeldin, {user.name}
                    </div>
                  )}
                </>
              )}
              <Link
                href="/"
                className="py-2 hover:text-blue-600 transition"
                onClick={closeMobileMenu}
              >
                Anasayfa
              </Link>
              <Link
                href="/hakkimizda"
                className="py-2 hover:text-blue-600 transition"
                onClick={closeMobileMenu}
              >
                Hakkımızda
              </Link>
              <Link
                href="/iletisim"
                className="py-2 hover:text-blue-600 transition"
                onClick={closeMobileMenu}
              >
                İletişim
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="py-2 hover:text-blue-600 transition"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profil"
                    className="py-2 hover:text-blue-600 transition"
                    onClick={closeMobileMenu}
                  >
                    Profil
                  </Link>
                  <Link
                    href="/yazilarim"
                    className="py-2 hover:text-blue-200 transition-colors duration-200 font-medium"
                    onClick={closeMobileMenu}
                  >
                    Yazılarım
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="py-2 bg-red-600 text-white px-4 rounded-md hover:bg-red-700 transition text-center"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <div className="w-full flex justify-center items-center gap-2">
                  <Link
                    href="/giris"
                    className="w-full py-2 bg-blue-600 text-white px-4 rounded-md hover:bg-blue-700 transition text-center"
                    onClick={closeMobileMenu}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit"
                    className="w-full py-2 bg-blue-600 text-white px-4 rounded-md hover:bg-blue-700 transition text-center"
                    onClick={closeMobileMenu}
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
