import Link from "next/link";
import Image from "next/image";
import { BlogCardProps } from "@/types/post";

export default function BlogCard({
  id,
  title,
  excerpt,
  author,
  createdAt,
  category,
  tags,
  status,
  coverImage,
  readTime,
  viewCount = 0,
  _count,
}: BlogCardProps) {
  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    const trimmed = text.slice(0, limit);
    const lastSpace = trimmed.lastIndexOf(" ");
    return trimmed.slice(0, lastSpace) + " ...";
  };

  return (
    <div className="relative bg-white rounded-md shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      {coverImage ? (
        <div className="h-48 w-full relative">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover bg-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-4xl font-bold">
            {title.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 flex justify-end items-start mb-2">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            status === "PUBLISHED"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status === "PUBLISHED" ? "Yayında" : "Taslak"}
        </span>
      </div>

      <div className="p-6">
        {/* Category & Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
              {category}
            </span>

            {readTime && (
              <>
                <span>•</span>
                <span>{readTime} dk</span>
              </>
            )}
          </div>

          <div className="flex justify-center items-center">
            {viewCount > 0 && (
              <span className="text-xs">{viewCount / 2} görüntülenme</span>
            )}

            {_count.comments > 0 && (
              <>
                <span className="mx-1">•</span>
                <span className="text-xs">{_count.comments} yorum</span>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 hover:text-blue-600 transition-colors line-clamp-2">
          <Link href={`/blog/${id}`}>{truncateText(title, 50)}</Link>
        </h3>

        {/* Excerpt */}
        <p className="h-5 text-gray-600 mb-4">{truncateText(excerpt, 45)}</p>

        {/* Footer */}
        <div className="flex justify-between items-center py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            <span>By {author.username}</span>
            <span className="mx-2">•</span>
            <span>{new Date(createdAt).toLocaleDateString("tr-TR")}</span>
          </div>

          <Link
            href={`/blog/${id}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
          >
            Devamını Oku
          </Link>
        </div>

        {/* Tags */}
        <div className="h-10 flex justify-start items-center gap-2 px-1 border-t border-gray-100 mt-2 overflow-hidden overflow-x-auto scrollbar-hide">
          {tags.map((tag, index) => {
            const colors = [
              "bg-red-200 text-red-800",
              "bg-green-200 text-green-800",
              "bg-blue-200 text-blue-800",
              "bg-yellow-200 text-yellow-800",
              "bg-purple-200 text-purple-800",
              "bg-pink-200 text-pink-800",
              "bg-indigo-200 text-indigo-800",
            ];

            const color = colors[index % colors.length]; // renkleri döngüye sokar

            return (
              <div
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}
              >
                {tag}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
