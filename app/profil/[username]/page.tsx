import { Metadata } from "next";
import ProfileDetailPage from "@/components/Pages/ProfileDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} - Kullanıcı Profili`,
    description: `${username} kullanıcısının profil sayfası`,
    keywords: `${username.toLowerCase()} profili, blog yazıları, teknoloji`,
    openGraph: {
      title: `${username} Profili | Blog Sitesi`,
      description: `${username} profilindeki tüm blog yazıları.`,
      type: "website",
    },
  };
}

export default async function ProfileDetail({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileDetailPage username={username} />;
}
