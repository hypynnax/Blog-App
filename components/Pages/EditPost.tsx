"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/Parts/MarkdownEditor";
import TagInput from "@/components/Parts/TagInput";
import toast from "react-hot-toast";
import { Category } from "@/types/category";

export default function EditPost({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    coverImage: "",
    status: "DRAFT",
  });
  const [tags, setTags] = useState<string[]>([]);

  // Veri çekme
  useEffect(() => {
    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  const fetchPostData = async () => {
    try {
      const [postResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/post/get/${postId}`),
        fetch("/api/category"),
      ]);

      if (!postResponse.ok) {
        toast.error("Yazı bulunamadı");
        router.push("/dashboard");
        return;
      }

      const postData = await postResponse.json();
      const post = postData.post;

      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        coverImage: post.coverImage || "",
        status: post.status,
      });
      setTags(post.tags || []);

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      toast.error("Yükleme hatası");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.excerpt.trim() ||
      !formData.content.trim()
    ) {
      toast.error("Başlık, özet ve içerik gerekli!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/post/get/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags,
          coverImage: formData.coverImage.trim() || null,
        }),
      });

      if (response.ok) {
        toast.success("Yazı güncellendi!");
        router.push("/dashboard");
      } else {
        const data = await response.json();
        toast.error(data.error || "Güncelleme hatası");
      }
    } catch (error) {
      toast.error("Güncelleme hatası");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu yazıyı silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Yazı silindi!");
        router.push("/dashboard");
      } else {
        toast.error("Silme hatası");
      }
    } catch (error) {
      toast.error("Silme hatası");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yazı yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Yazıyı Düzenle</h1>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50"
          >
            Yazıyı Sil
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-md shadow-md p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Başlık *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Yazınızın başlığını girin"
                maxLength={200}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium mb-2">Özet *</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                required
                rows={3}
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Yazınızın kısa özetini girin"
                maxLength={500}
              />
            </div>

            {/* Category & Cover Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Kapak Resmi URL
                </label>
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Tags */}
            <TagInput tags={tags} onTagsChange={setTags} />
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-md shadow-md p-6">
            <label className="block text-sm font-medium mb-4">İçerik *</label>
            <MarkdownEditor
              value={formData.content}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, content: value }))
              }
              placeholder="Yazınızın içeriğini buraya yazın..."
            />
          </div>

          {/* Actions */}
          <div className="bg-white rounded-md shadow-md p-6">
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-medium mb-2">Durum</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">Taslak</option>
                  <option value="PUBLISHED">Yayınla</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Güncelleniyor..." : "Güncelle"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
