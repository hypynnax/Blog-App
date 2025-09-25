"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "@/components/Parts/BlogCard";
import Pagination from "@/components/Parts/Pagination";
import { BlogCardProps } from "@/types/post";
import { useAuth } from "@/hooks/useAuth";

export default function UserPostsPage() {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState<BlogCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const blogsPerPage = 6;

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/profile/posts/${user?.id}`);
      if (!response.ok) throw new Error("Yazı bulunamadı");

      const data = await response.json();
      setUserPosts(data.data.posts);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = userPosts.filter((post) => {
    if (filter === "all") return true;
    return post.status === filter;
  });

  const totalPages = Math.ceil(filteredPosts.length / blogsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Yazılarım</h1>
          <Link
            href="/yazi-olustur"
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Yeni Yazı Oluştur
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-md shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`w-full md:w-auto px-4 py-2 rounded-md font-medium transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              Tümü ({userPosts.length})
            </button>
            <button
              onClick={() => setFilter("PUBLISHED")}
              className={`w-full md:w-auto px-4 py-2 rounded-md font-medium transition ${
                filter === "PUBLISHED"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              Yayında (
              {userPosts.filter((p) => p.status === "PUBLISHED").length})
            </button>
            <button
              onClick={() => setFilter("DRAFT")}
              className={`w-full md:w-auto px-4 py-2 rounded-md font-medium transition ${
                filter === "DRAFT"
                  ? "bg-yellow-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              Taslak ({userPosts.filter((p) => p.status === "DRAFT").length})
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosts.map((post) => (
            <div key={post.id} className="relative">
              <BlogCard {...post} />

              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Link
                  href={`/yazi-duzenle/${post.id}`}
                  className="bg-white/90 hover:bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium shadow transition"
                >
                  Düzenle
                </Link>
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    post.status === "PUBLISHED"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {post.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-md shadow-md">
            <p className="text-gray-500 text-lg mb-4">
              {filter === "all"
                ? "Henüz hiç yazınız yok."
                : filter === "PUBLISHED"
                ? "Yayında hiç yazınız yok."
                : "Taslak hiç yazınız yok."}
            </p>
            <Link
              href="/yazi-olustur"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              İlk Yazınızı Oluşturun
            </Link>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}
