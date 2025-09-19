import { Metadata } from "next";
import ProfileDetailPage from "@/components/Pages/ProfileDetail";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const username = params.username;
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

export default function ProfileDetail({
  params,
}: {
  params: { username: string };
}) {
  return <ProfileDetailPage username={params.username} />;
}
