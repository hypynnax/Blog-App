"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BlogCard from "@/components/Parts/BlogCard";
import { useAuth } from "@/hooks/useAuth";
import CommentCard from "@/components/Parts/CommentCard";
import toast from "react-hot-toast";
import { BlogCardProps } from "@/types/post";
import { CommentCardProps } from "@/types/comment";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    username: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    bio: "",
    website: "",
    location: "",
    _count: {
      posts: 0,
      comments: 0,
    },
  });

  const [userPosts, setUserPosts] = useState<BlogCardProps[]>([]);
  const [userComments, setUserComments] = useState<CommentCardProps[]>([]);

  // User bilgilerini form'a yükle
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        _count: {
          posts: user._count?.posts || 0,
          comments: user._count?.comments || 0,
        },
      });
    }
  }, [user]);

  // Posts'ları yükle
  const fetchUserPosts = async () => {
    if (!user) return;

    setPostsLoading(true);
    try {
      const response = await fetch(`/api/user/profile/posts/${user.id}`);
      if (response.ok) {
        const { data } = await response.json();
        setUserPosts(data.posts || []);
      } else {
        toast.error("Yazılar yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Yazılar yüklenirken hata oluştu");
    } finally {
      setPostsLoading(false);
    }
  };

  // Comments'ları yükle
  const fetchUserComments = async () => {
    if (!user) return;

    setCommentsLoading(true);
    try {
      const response = await fetch(`/api/user/profile/comments/${user.id}`);
      if (response.ok) {
        const { data } = await response.json();
        setUserComments(data.comments || []);
      } else {
        toast.error("Yorumlar yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching user comments:", error);
      toast.error("Yorumlar yüklenirken hata oluştu");
    } finally {
      setCommentsLoading(false);
    }
  };

  // Tab değiştiğinde ilgili verileri yükle
  useEffect(() => {
    if (activeTab === "posts" && userPosts.length === 0) {
      fetchUserPosts();
    } else if (activeTab === "comments" && userComments.length === 0) {
      fetchUserComments();
    }
  }, [activeTab, user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/user/profile/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Profil başarıyla güncellendi!");
        await refreshUser(); // User bilgilerini yenile
      } else {
        toast.error(result.error || "Profil güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Profil güncellenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

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

    setProfileData((prev) => ({ ...prev, phone: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  async function updateComment(id: string, currentContent: string) {
    const newContent = prompt("Yorumu güncelle:", currentContent);

    if (!newContent || newContent.trim() === "") return;

    try {
      const res = await fetch(`/api/comment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });

      if (!res.ok) {
        throw new Error("Yorum güncellenemedi");
      }

      const data = await res.json();
      toast.success("Yorum başarıyla güncellendi!");
      fetchUserComments();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteComment(id: string) {
    if (!confirm("Yorumunuzu silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/comment/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Yorum silinemedi");
      }

      const data = await res.json();
      toast.success("Yorum başarıyla silindi!");
      fetchUserComments();
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-2 md:px-6 py-8">
        <div className="bg-white rounded-md shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
              <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold relative">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Profil Resmi"
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <>
                    {user.name.charAt(0).toUpperCase()}
                    {user.surname.charAt(0).toUpperCase()}
                  </>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">
                  {user.name} {user.surname}
                </h1>
                <h2 className="text-xl">@{user.username}</h2>
                <p className="text-blue-100">{user.email}</p>
                {user.location && (
                  <p className="text-blue-100">{user.location}</p>
                )}
                {user.bio && (
                  <p className="text-blue-100 mt-2 max-w-md">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-6 py-4 font-medium ${
                  activeTab === "info"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-6 py-4 font-medium ${
                  activeTab === "posts"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                Yazılarım ({profileData._count.posts})
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-6 py-4 font-medium ${
                  activeTab === "comments"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                Yorumlarım ({profileData._count.comments})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-8">
            {activeTab === "info" && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                      disabled // Email değiştirilemez
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email adresi değiştirilemez
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      İsim
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Soyisim
                    </label>
                    <input
                      type="text"
                      name="surname"
                      value={profileData.surname}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Telefon
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={profileData.phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+90 555 123 45 67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Konum
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="İstanbul, Türkiye"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Biyografi
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Kendiniz hakkında kısa bilgi..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profileData.bio.length}/500 karakter
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Güncelleniyor..." : "Profili Güncelle"}
                </button>
              </form>
            )}

            {activeTab === "posts" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">
                    Yazılarım ({userPosts.length})
                  </h2>
                  <Link
                    href="/yazi-olustur"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                  >
                    Yeni Yazı
                  </Link>
                </div>

                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {userPosts.map((post) => (
                      <BlogCard key={post.id} {...post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Henüz hiç yazınız yok.</p>
                    <Link
                      href="/yazi-olustur"
                      className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
                    >
                      İlk Yazınızı Oluşturun
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "comments" && (
              <div>
                <h2 className="text-xl font-bold mb-6">
                  Yorumlarım ({userComments.length})
                </h2>

                {commentsLoading ? (
                  <div className="text-center py-8">
                    <div
                      key={""}
                      className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
                    ></div>
                  </div>
                ) : userComments.length > 0 ? (
                  <div className="space-y-4">
                    {userComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex justify-between items-center bg-gray-50 rounded-md p-2"
                      >
                        <CommentCard key={comment.id} {...comment} />
                        <div className="flex flex-col justify-end items-center gap-2 mr-2">
                          <button
                            className="w-full bg-green-500 font-bold text-white cursor-pointer p-2"
                            onClick={() =>
                              updateComment(comment.id, comment.content)
                            }
                          >
                            Düzenle
                          </button>
                          <button
                            className="w-full bg-red-500 font-bold text-white cursor-pointer p-2"
                            onClick={() => deleteComment(comment.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      Henüz hiç yorumunuz yok.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
