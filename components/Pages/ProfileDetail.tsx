"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import BlogCard from "@/components/Parts/BlogCard";
import { BlogCardProps } from "@/types/post";
import toast from "react-hot-toast";
import { AuthUser } from "@/types/auth";

export default function ProfileDetail({ username }: { username: string }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userPosts, setUserPosts] = useState<BlogCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [username]);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  // User bilgilerini çek
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${username}`);

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 404) {
        toast.error("Kullanıcı bulunamadı");
      } else {
        toast.error("Kullanıcı yüklenemedi");
      }
    } catch (error) {
      toast.error("Kullanıcı yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Posts'ları yükle
  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      if (user) {
        const response = await fetch(`/api/post/${user.id}`);

        if (response.ok) {
          const data = await response.json();
          setUserPosts(data.posts || []);
        } else {
          toast.error("Yazılar yüklenemedi");
        }
      }
    } catch (error) {
      toast.error("Yazılar yüklenirken hata oluştu");
    } finally {
      setPostsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Kullanıcı Bulunamadı
          </h1>
          <p className="text-gray-600">Aradığınız kullanıcı mevcut değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-2 md:px-6 py-8">
        <div className="bg-white rounded-md shadow-md overflow-hidden">
          {/* Profile Header */}
          <div>
            {/* Background Image */}
            <div
              className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-blue-700 relative"
              style={{
                backgroundImage: user?.bgImage
                  ? `url(${user.bgImage})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {!user?.bgImage && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700" />
              )}
            </div>

            {/* Profile Content */}
            <div className="flex justify-center md:justify-start items-center px-8 -mt-20">
              <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold relative border-4 border-white shadow-lg overflow-hidden">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Profil Resmi"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    {user.name.charAt(0).toUpperCase()}
                    {user.surname.charAt(0).toUpperCase()}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profil Info Content */}
          <div className="p-4 md:p-8">
            <h1 className="text-xl font-bold mb-6">Profil Bilgileri</h1>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">İsim</label>
                  <p className="w-full px-4 py-2 border rounded-md bg-gray-50">
                    {user.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Soyisim
                  </label>
                  <p className="w-full px-4 py-2 border rounded-md bg-gray-50">
                    {user.surname}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <p className="w-full px-4 py-2 border rounded-md bg-gray-50">
                    {user.email}
                  </p>
                </div>
                {user.phone && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Telefon
                    </label>
                    <p className="w-full px-4 py-2 border rounded-md bg-gray-50">
                      {user.phone}
                    </p>
                  </div>
                )}
              </div>

              {user.bio && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Biyografi
                  </label>
                  <p className="w-full px-4 py-2 border rounded-md bg-gray-50 min-h-[80px]">
                    {user.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.website && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website
                    </label>
                    <p className="w-full px-4 py-2 border rounded-md bg-gray-50">
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {user.website}
                      </a>
                    </p>
                  </div>
                )}
                {user.location && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Konum
                    </label>
                    <p className="w-full px-4 py-2 border rounded-md bg-gray-50">
                      {user.location}
                    </p>
                  </div>
                )}
              </div>

              {/* İstatistikler */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-md">
                  <div className="text-2xl font-bold text-blue-600">
                    {user._count?.posts}
                  </div>
                  <div className="text-sm text-gray-600">Yazı</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">
                    {user._count?.comments}
                  </div>
                  <div className="text-sm text-gray-600">Yorum</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-md">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(user.createdAt).getFullYear()}
                  </div>
                  <div className="text-sm text-gray-600">Katılım Yılı</div>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 mt-10"></div>

            {/* Articles Content */}
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-6">
                {user.name}&apos;in Yazıları ({userPosts.length})
              </h2>

              {postsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Yazılar yükleniyor...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {userPosts.map((post) => (
                      <BlogCard key={post.id} {...post} />
                    ))}
                  </div>

                  {userPosts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">
                        {user.name} henüz hiç yazı paylaşmamış.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
