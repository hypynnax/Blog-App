import Image from "next/image";
import { UserCardProps } from "@/types/auth";
import Link from "next/link";

export default function UserCard({
  id,
  username,
  name,
  surname,
  avatar,
  bio,
}: UserCardProps) {
  return (
    <Link
      href={`/profil/${username}`}
      className="bg-white rounded-md shadow-md p-6 flex flex-col items-center"
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={username}
          width={80}
          height={80}
          className="w-20 h-20 rounded-full mb-4"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-400 rounded-full mb-4 flex justify-center items-center text-white font-bold text-2xl">
          {name.charAt(0)}
          {surname.charAt(0)}
        </div>
      )}
      <p className="text-gray-500">@{username}</p>
      <h3 className="text-lg font-semibold">
        {name} {surname}
      </h3>
      {bio && <p className="text-gray-600 mt-2 text-sm text-center">{bio}</p>}
    </Link>
  );
}
