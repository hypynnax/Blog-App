import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailPage from "@/components/Pages/BlogDetail";

// Dynamic metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    return {
      title: "Yazı Bulunamadı",
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt ?? "",
    keywords: `${blog.category}, blog, ${blog.title}`,
    openGraph: {
      title: blog.title,
      description: blog.excerpt ?? "",
      type: "article",
      publishedTime: blog.publishedAt,
      authors: [blog.author?.username ?? "Anonim"],
      images: blog.coverImage ? [blog.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt ?? "",
      images: blog.coverImage ? [blog.coverImage] : undefined,
    },
  };
}

async function getBlogById(id: string) {
  const res = await fetch(`https://bloguygulamam.vercel.app/api/post/get/no-views/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Yazı alınamadı");
  }

  const data = await res.json();
  return data.post;
}

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    notFound();
  }

  return <BlogDetailPage id={id} />;
}
