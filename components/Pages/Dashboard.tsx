"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { BlogCardProps } from "@/types/post";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<BlogCardProps[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/user/profile/posts/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecentPosts(data.data.posts);
      }
    } catch (error) {
      toast.error("Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`"${postTitle}" yazısını silmek istediğinizden emin misiniz?`))
      return;

    try {
      const response = await fetch(`/api/user/profile/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Yazı silindi");
        fetchDashboardData();
      } else {
        toast.error("Silme işlemi başarısız");
      }
    } catch (error) {
      toast.error("Hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-md shadow-md">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-pulse space-y-8 mt-8">
            <div className="bg-white p-6 rounded-md shadow-md">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="flex items-center gap-4">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>

          <div className="animate-pulse space-y-8 mt-8">
            <div className="bg-white p-6 rounded-md shadow-md">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>

              <div className="grid grid-rows-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-md p-1"
                  >
                    <div className="h-4 bg-gray-200 w-1/2 mb-2"></div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="h-4 bg-gray-200"></div>
                      <div className="h-4 bg-gray-200"></div>
                      <div className="h-4 bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-md shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Toplam Yazı
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {user?._count?.posts}
            </p>
          </div>
          <div className="bg-white rounded-md shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Toplam Yorum
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {user?._count?.comments}
            </p>
          </div>
          <div className="bg-white rounded-md shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Toplam Görüntülenme
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {user?._count?.views}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-md shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Hızlı İşlemler</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/yazi-olustur"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            >
              Yeni Yazı Oluştur
            </Link>
            <Link
              href="/profil"
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition"
            >
              Profili Düzenle
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-md shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Son Yazılarım</h2>

          {recentPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Henüz yazınız yok</p>
              <Link
                href="/yazi-olustur"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
              >
                İlk Yazımı Oluştur
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex justify-between items-center p-4 border rounded-md"
                >
                  <div>
                    <h3 className="font-medium">{post.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          post.status === "PUBLISHED"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                      </span>
                      <span>•</span>
                      <span>{post.viewCount} görüntülenme</span>
                      <span>•</span>
                      <span>{post._count.comments} yorum</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/yazi-duzenle/${post.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="text-red-600 hover:underline text-sm cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
