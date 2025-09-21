import Link from "next/link";
import Image from "next/image";
import { CommentCardProps } from "@/types/comment";

export default function CommentCard({
  id,
  postId,
  author,
  content,
  createdAt,
}: CommentCardProps) {
  return (
    <div className="w-full relative bg-gray-50 rounded-md p-4 mb-4">
      <Link
        href={`https://bloguygulamam.vercel.app/blog/${postId}`}
        className="absolute inset-0"
      ></Link>

      <div className="relative inline-block">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href={
              author.username
                ? `https://bloguygulamam.vercel.app/profil/${author.username}`
                : ""
            }
            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold relative overflow-hidden"
          >
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt="Profil Resmi"
                fill
                className="object-cover"
              />
            ) : (
              <>
                {author.name.charAt(0).toUpperCase()}
                {author.surname.charAt(0).toUpperCase()}
              </>
            )}
          </Link>

          <div>
            <Link
              href={
                author.username
                  ? `https://bloguygulamam.vercel.app/profil/${author.username}`
                  : ""
              }
              className="font-medium"
            >
              {author.name} {author.surname}
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>

        <p className="text-gray-700">{content}</p>
      </div>
    </div>
  );
}
