"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  facebookSocialIcon,
  githubSocialIcon,
  instagramSocialIcon,
  linkedinSocialIcon,
  webIcon,
  xSocialIcon,
} from "@/icons/icon";
import { Category } from "@/types/category";

export default function Footer() {
  const [page, setPage] = useState({
    visible: false,
    year: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);

  /* Güncel Yıl Hesaplama */
  useEffect(() => {
    fetchCategories();
    setPage((prev) => ({ ...prev, year: new Date().getFullYear().toString() }));

    const toggleVisibility = () => {
      setPage((prev) => ({ ...prev, visible: window.scrollY > 300 }));
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/category`);
      if (response.ok) {
        const data = await response.json();

        const categories = data.categories;
        const limitedCategories =
          categories.length <= 4 ? categories : categories.slice(0, 4);

        setCategories(limitedCategories);
      }
    } catch (error) {
      console.error("Categories error:", error);
    }
  };

  return (
    <footer className="text-white border-t">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">Blog</h3>
            <p className="text-gray-300 mb-8">
              Teknoloji ve web geliştirme alanında güncel içerikler.
            </p>
            <div className="flex items-center flex-wrap gap-4">
              <a
                href="https://www.instagram.com/hypynnax/#"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center transition"
              >
                {instagramSocialIcon}
              </a>
              <a
                href="https://www.facebook.com/hypynnax"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center transition"
              >
                {facebookSocialIcon}
              </a>
              <a
                href="https://x.com/lhypynnax"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center transition bg-white rounded-md p-[1px]"
              >
                {xSocialIcon}
              </a>
              <a
                href="https://www.linkedin.com/in/nurullahkara"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center transition"
              >
                {linkedinSocialIcon}
              </a>
              <a
                href="https://github.com/hypynnax"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center transition"
              >
                {githubSocialIcon}
              </a>
              <a
                href="https://nurullahkara.vercel.app/"
                target="_blank"
                className="w-8 h-8 flex items-center justify-center transition"
              >
                {webIcon}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Hızlı Linkler</h4>
            <div className="space-y-2 text-gray-300">
              <Link
                href="/"
                className="flex justify-center items-center border rounded-md group p-2 cursor-pointer hover:bg-white hover:text-black hover:border-black transition"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/hakkimizda"
                className="flex justify-center items-center border rounded-md group p-2 cursor-pointer hover:bg-white hover:text-black hover:border-black transition"
              >
                Hakkımızda
              </Link>
              <Link
                href="/iletisim"
                className="flex justify-center items-center border rounded-md group p-2 cursor-pointer hover:bg-white hover:text-black hover:border-black transition"
              >
                İletişim
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">Kategoriler</h4>
            <div className="space-y-2 text-gray-300">
              {categories.length != 0 ? (
                <>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/kategori/${category.slug}`}
                      className="flex justify-center items-center border rounded-md group p-2 cursor-pointer hover:bg-white hover:text-black hover:border-black transition"
                    >
                      {category.name}
                    </Link>
                  ))}
                </>
              ) : (
                <p className="flex justify-center items-center border rounded-md group p-2 cursor-pointer hover:bg-white hover:text-black hover:border-black transition">
                  Henüz kategori yok
                </p>
              )}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4">Bülten</h4>
            <p className="text-gray-300 mb-4 text-sm">
              Yeni yazılardan haberdar olmak için bültenimize abone olun.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition text-sm cursor-pointer">
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-12 pt-8 text-center text-gray-300">
          <p>&copy; {page.year} Blog. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
