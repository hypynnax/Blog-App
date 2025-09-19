"use client";
import { useState, useEffect } from "react";
import BlogCard from "@/components/Parts/BlogCard";
import SearchBar from "@/components/Parts/SearchBar";
import CategoryFilter from "@/components/Parts/CategoryFilter";
import Pagination from "@/components/Parts/Pagination";
import toast from "react-hot-toast";
import { BlogCardProps } from "@/types/post";
import { Category } from "@/types/category";
import { searchBarIcon } from "@/icons/icon";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [blogs, setBlogs] = useState<BlogCardProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Blog verilerini çek
  const fetchBlogs = async (search = "") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/search/posts?q=${search}&category=${selectedCategory}`
      );

      if (!response.ok) {
        throw new Error("Blog yazıları yüklenemedi");
      }

      const data = await response.json();
      setBlogs(data.posts);
    } catch (error) {
      console.error("Fetch blogs error:", error);
      setError("Blog yazıları yüklenirken hata oluştu");
      toast.error("Blog yazıları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Kategorileri çek
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category");

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  // İlk yüklemede verileri çek
  useEffect(() => {
    fetchCategories();
    fetchBlogs(searchQuery);
  }, []);

  // Arama, kategori veya sayfa değiştiğinde verileri yeniden çek
  useEffect(() => {
    fetchBlogs(searchQuery);
  }, [currentPage, selectedCategory, searchQuery]);

  // Arama fonksiyonu
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Arama yapınca ilk sayfaya dön
  };

  // Kategori değiştirme fonksiyonu
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Kategori değişince ilk sayfaya dön
  };

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Yumuşak scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim() !== "") {
      router.push(`kategori/${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          className="absolute inset-0"
        ></div>
      )}
      {/* Hero Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Teknoloji Blogu
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Web geliştirme, programlama ve teknoloji hakkında güncel yazılar
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <SearchBar onSearch={handleSearch} placeholder="Yazılarda ara..." />

        <div className="flex justify-center items-center gap-2">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          <div className="flex items-center">
            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                className="border bg-gray-200 hover:bg-gray-300 rounded-full p-1 mb-6 transition-all duration-300"
              >
                {searchBarIcon}
              </button>
            ) : (
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kategori Ara..."
                autoFocus
                className="border rounded-full px-4 py-1 mb-6 outline-none transition-all duration-300 w-4 focus:w-64"
              />
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchBlogs(searchQuery)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition cursor-pointer"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} {...blog} />
              ))}
            </div>

            {/* No Results */}
            {blogs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Yazı Bulunamadı
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "Aradığınız kriterlere uygun yazı bulunamadı."
                    : "Henüz hiç yazı yayınlanmamış."}
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setCurrentPage(1);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {currentPage > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={blogs.length / 6}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Stats */}
        {!loading && !error && blogs.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            {searchQuery || selectedCategory !== "all" ? (
              <p>
                {selectedCategory !== "all" &&
                  `"${selectedCategory}" kategorisinde `}
                {searchQuery && `"${searchQuery}" araması için `}
                toplam {blogs.length} yazı bulundu
              </p>
            ) : (
              <p>En son yayınlanan blog yazıları</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
