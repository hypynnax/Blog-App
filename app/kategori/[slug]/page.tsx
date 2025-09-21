import { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPage from "@/components/Pages/Category";

// Kategorileri çeken function
async function getCategories() {
  const res = await fetch(`http://localhost:3000/api/category`, {
    cache: "no-store", // her istekte güncel veriyi çekmek için
  });

  if (!res.ok) {
    throw new Error("Kategoriler alınamadı");
  }

  const data = await res.json();
  return data.categories;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === slug);

  if (!category) {
    return { title: "Kategori Bulunamadı" };
  }

  return {
    title: `${category.name} Yazıları`,
    description: `${category.name} kategorisinedeki tüm blog yazıları. Güncel ve kaliteli içerikler.`,
    keywords: `${category.name.toLowerCase()}, blog yazıları, teknoloji`,
    openGraph: {
      title: `${category.name} Yazıları | Blog Sitesi`,
      description: `${category.name} kategorisinedeki tüm blog yazıları.`,
      type: "website",
    },
  };
}

export default async function Category({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c: any) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return <CategoryPage category={category.name} slug={category.slug} />;
}
