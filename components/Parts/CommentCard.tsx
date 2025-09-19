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
      <Link href={`blog/${postId}`} className="absolute inset-0"></Link>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
        </div>
        <div>
          <Link
            href={author.username ? `profil/${author.username}` : ""}
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
  );
}
