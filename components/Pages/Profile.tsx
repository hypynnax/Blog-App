"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import BlogCard from "@/components/Parts/BlogCard";
import { useAuth } from "@/hooks/useAuth";
import CommentCard from "@/components/Parts/CommentCard";
import toast from "react-hot-toast";
import { BlogCardProps } from "@/types/post";
import { CommentCardProps } from "@/types/comment";
import { editIcon, uploadIcon, deleteIcon, closeIcon } from "@/icons/icon";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState<{
    profile: boolean;
    background: boolean;
  }>({ profile: false, background: false });

  // File input refs
  const profileImageRef = useRef<HTMLInputElement>(null);
  const backgroundImageRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);

  const [profileData, setProfileData] = useState({
    username: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    bio: "",
    website: "",
    location: "",
    avatar: "",
    bgImage: "",
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
        avatar: user.avatar || "",
        bgImage: user.bgImage || "",
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

  // Image upload functions
  const uploadImage = async (file: File, type: "profile" | "background") => {
    if (!user) return null;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    setImageUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await fetch("/api/upload/user/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `${
            type === "profile" ? "Profil" : "Arka plan"
          } resmi başarıyla yüklendi!`
        );
        await refreshUser();
        return result.imageUrl;
      } else {
        toast.error(result.error || "Resim yüklenirken hata oluştu");
        return null;
      }
    } catch (error) {
      toast.error("Resim yüklenirken hata oluştu");
      return null;
    } finally {
      setImageUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const deleteImage = async (type: "profile" | "background") => {
    if (!user) return;

    try {
      const response = await fetch("/api/upload/user/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `${
            type === "profile" ? "Profil" : "Arka plan"
          } resmi başarıyla silindi!`
        );
        await refreshUser();
      } else {
        toast.error(result.error || "Resim silinirken hata oluştu");
      }
    } catch (error) {
      toast.error("Resim silinirken hata oluştu");
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "background"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seçin");
      return;
    }

    await uploadImage(file, type);

    // Close modals
    setShowProfileModal(false);
    setShowBackgroundModal(false);

    // Reset file inputs
    if (profileImageRef.current) profileImageRef.current.value = "";
    if (backgroundImageRef.current) backgroundImageRef.current.value = "";
  };

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
        await refreshUser();
      } else {
        toast.error(result.error || "Profil güncellenirken hata oluştu");
      }
    } catch (error) {
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
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 3) {
      value = value.replace(/(\d{1,3})/, "($1");
    } else if (value.length <= 6) {
      value = value.replace(/(\d{3})(\d{1,3})/, "($1) $2");
    } else if (value.length <= 8) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,2})/, "($1) $2 $3");
    } else if (value.length <= 10) {
      value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{1,2})/, "($1) $2 $3 $4");
    } else {
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
      toast.error("Yorum güncellenirken hata oluştu!");
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
      toast.error("Yorum silinirken hata oluştu!");
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
          <div className="relative">
            {/* Background Image with Edit Button */}
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

              {/* Background Edit Button */}
              <button
                onClick={() => setShowBackgroundModal(true)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all cursor-pointer"
                disabled={imageUploading.background}
              >
                {imageUploading.background ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>{editIcon}</>
                )}
              </button>
            </div>

            {/* Profile Content */}
            <div className="px-2 md:px-8 pb-2 lg:pb-8 -mt-16 relative z-10">
              <div className="flex flex-col lg:flex-row flex-wrap justify-start items-start lg:gap-6">
                {/* Profile Image with Edit Button */}
                <div className="relative">
                  <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold relative border-4 border-white shadow-lg overflow-hidden">
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

                  {/* Profile Image Edit Button */}
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="absolute -top-0 -right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-md cursor-pointer border"
                    disabled={imageUploading.profile}
                  >
                    {imageUploading.profile ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>{editIcon}</>
                    )}
                  </button>
                </div>

                <div className="text-black lg:pt-14 mt-4">
                  <h1 className="text-3xl font-bold">
                    {user.name} {user.surname}
                  </h1>
                  <h2 className="text-xl">@{user.username}</h2>
                  <p className="text-blue-500">{user.email}</p>
                  {user.location && (
                    <p className="text-black/60">{user.location}</p>
                  )}
                  {user.bio && <p className="mt-2 max-w-md">{user.bio}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-6 py-4 text-sm md:text-base font-medium ${
                  activeTab === "info"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-6 py-4 text-sm md:text-base font-medium ${
                  activeTab === "posts"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }`}
              >
                Yazılarım ({profileData._count.posts})
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-6 py-4 text-sm md:text-base font-medium ${
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
          <div className="p-4 lg:p-8">
            {activeTab === "info" && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email adresi değiştirilemez
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : userComments.length > 0 ? (
                  <div className="space-y-4">
                    {userComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex flex-wrap md:flex-nowrap justify-between items-center bg-gray-50 rounded-md p-2"
                      >
                        <CommentCard key={comment.id} {...comment} />
                        <div className="w-full md:w-auto flex md:flex-col justify-end items-center gap-2 mr-2">
                          <button
                            className="w-1/2 md:w-full bg-green-500 font-bold text-white cursor-pointer p-2"
                            onClick={() =>
                              updateComment(comment.id, comment.content)
                            }
                          >
                            Düzenle
                          </button>
                          <button
                            className="w-1/2 md:w-full bg-red-500 font-bold text-white cursor-pointer p-2"
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

      {/* Profile Image Modal */}
      {showProfileModal && (
        <div
          onClick={() => setShowProfileModal(false)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Profil Resmi</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <>{closeIcon}</>
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => profileImageRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 transition"
                disabled={imageUploading.profile}
              >
                <>{uploadIcon}</>
                {user?.avatar ? "Resmi Değiştir" : "Resim Ekle"}
              </button>

              {user?.avatar && (
                <button
                  onClick={() => {
                    deleteImage("profile");
                    setShowProfileModal(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition"
                >
                  <>{deleteIcon}</>
                  Resmi Sil
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Background Image Modal */}
      {showBackgroundModal && (
        <div
          onClick={() => setShowBackgroundModal(false)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Arka Plan Resmi</h3>
              <button
                onClick={() => setShowBackgroundModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <>{closeIcon}</>
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => backgroundImageRef.current?.click()}
                className="w-full flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50 transition"
                disabled={imageUploading.background}
              >
                <>{uploadIcon}</>
                {user?.bgImage ? "Resmi Değiştir" : "Resim Ekle"}
              </button>

              {user?.bgImage && (
                <button
                  onClick={() => {
                    deleteImage("background");
                    setShowBackgroundModal(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition"
                >
                  <>{deleteIcon}</>
                  Resmi Sil
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={profileImageRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e, "profile")}
        className="hidden"
      />
      <input
        ref={backgroundImageRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e, "background")}
        className="hidden"
      />
    </div>
  );
}
