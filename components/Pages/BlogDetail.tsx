"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CommentCard from "@/components/Parts/CommentCard";
import CommentForm from "@/components/Parts/CommentForm";
import { Post } from "@/types/post";
import { CommentCardProps } from "@/types/comment";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface BlogDetailProps {
  id: string;
}

export default function BlogDetail({ id }: BlogDetailProps) {
  const { user } = useAuth();
  const [post, setPost] = useState<Post>();
  const [comments, setComments] = useState<CommentCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
    fetchComment();
  }, [id]);

  async function fetchPost() {
    try {
      setLoading(true);
      const response = await fetch(`/api/post/get/${id}`);
      if (!response.ok) throw new Error("Yazı bulunamadı");

      const data = await response.json();
      setPost(data.post);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  async function fetchComment() {
    try {
      const response = await fetch(`/api/comment/${id}`);
      if (!response.ok) throw new Error("Yorumlar alınamadı");

      const data = await response.json();
      setComments(data.data.comments);
    } catch (err) {
      toast.error("Yorumlar alınırken hata oluştu!");
    }
  }

  const handleCommentSubmit = async (newComment: string) => {
    if (!user) {
      toast((t) => (
        <span>
          Yorum yapabilmek için giriş yapmalısınız.
          <button onClick={() => toast.dismiss(t.id)}>Tamam</button>
        </span>
      ));
      return;
    }

    const comment: CommentCardProps = {
      id: Date.now().toString(),
      postId: id,
      author: {
        username: user?.username || "Anonim",
        name: user?.name || "",
        surname: user?.surname || "",
        avatar: user?.avatar || "",
      },
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [comment, ...prev]);

    try {
      const response = await fetch(`/api/comment/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...comment,
        }),
      });

      if (response.ok) {
        toast.success("Yorum kaydedildi!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Hata oluştu");
      }
    } catch (error) {
      toast.error("Kaydetme hatası");
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

  if (error) {
    return <p className="text-center py-10 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Ana Sayfa
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">Blog</span>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">{post?.title}</span>
        </nav>

        {/* Blog Content */}
        <article className="bg-white rounded-md shadow-md overflow-hidden">
          {post?.coverImage && (
            <div className="h-75 w-full relative">
              <Image
                src={post?.coverImage}
                alt={post?.title}
                fill
                className="object-cover bg-center"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                {post?.category}
              </span>
              <span>•</span>
              <span>{post?.readTime} dk</span>
              <span>•</span>
              <span>
                {new Date(post?.publishedAt ?? new Date()).toLocaleDateString(
                  "tr-TR"
                )}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {post?.title}
            </h1>

            <div className="flex items-center gap-3 mb-8 pb-8 border-b">
              <Link
                href={`https://bloguygulamam.vercel.app/profil/${post?.author.username}`}
                className="relative w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
              >
                {post?.author?.avatar ? (
                  <Image
                    src={post?.author?.avatar}
                    alt="Profil Resmi"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    {post?.author?.name?.charAt(0).toUpperCase()}
                    {post?.author?.surname?.charAt(0).toUpperCase()}
                  </>
                )}
              </Link>
              <div>
                <Link
                  href={`https://bloguygulamam.vercel.app/profil/${post?.author.username}`}
                  className="font-medium"
                >
                  {post?.author?.username}
                </Link>
                <p className="text-sm text-gray-500">Yazar</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: post?.content ?? "Henüz İçerik Yok...",
                }}
              />
            </div>

            {post?.tags?.length != 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <b className="whitespace-nowrap">Etiketler : </b>
                {post?.tags?.map((tag, index) => (
                  <div
                    key={index}
                    className="border border-gray-400 rounded-full px-3 py-1 bg-gray-200"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <section className="bg-white rounded-md shadow-md p-8 mt-8">
          <h3 className="text-2xl font-bold mb-6">
            Yorumlar ({comments?.length})
          </h3>

          <div className="mb-8">
            <CommentForm onSubmit={handleCommentSubmit} />
          </div>

          <div>
            {comments?.map((comment) => (
              <CommentCard key={comment.id} {...comment} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
