"use client";
import { useState, useEffect } from "react";
import BlogCard from "@/components/Parts/BlogCard";
import Pagination from "@/components/Parts/Pagination";
import Link from "next/link";
import { BlogCardProps } from "@/types/post";

export default function Category({
  category,
  slug,
}: {
  category: string;
  slug: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<BlogCardProps[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryDisplayName, setCategoryDisplayName] = useState(category);

  const blogsPerPage = 6;

  // API'den veri çek
  const fetchCategoryPosts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/category/${slug}`);

      if (!response.ok) {
        throw new Error("Veriler yüklenirken hata oluştu");
      }

      const data = await response.json();

      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa değiştiğinde veri çek
  useEffect(() => {
    fetchCategoryPosts(currentPage);
  }, [currentPage, category, slug]);

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Sayfanın en üstüne scroll yap
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="h-4 bg-gray-300 rounded w-64 mb-6"></div>

            {/* Header skeleton */}
            <div className="bg-white rounded-md shadow-md p-8 mb-8">
              <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-md shadow-md p-6">
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error durumu
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-md shadow-md p-8 text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Hata</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchCategoryPosts(currentPage)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Tekrar Dene
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Ana Sayfa
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Kategori</span>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">{categoryDisplayName}</span>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-md shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {categoryDisplayName}
          </h1>
          <p className="text-gray-600">{pagination.totalCount} yazı bulundu</p>
        </div>

        {/* Blog Grid */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((blog) => (
                <BlogCard key={blog.id} {...blog} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-md shadow-md">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-2">
              Bu kategoride henüz yazı bulunmuyor.
            </p>
            <Link href="/" className="text-blue-600 hover:underline">
              Ana sayfaya dön
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
