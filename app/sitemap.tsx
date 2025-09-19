import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    {
      url: "https://bloguygulamam.vercel.app",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: "https://bloguygulamam.vercel.app/hakkimizda",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: "https://bloguygulamam.vercel.app/iletisim",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  const blogPages = [
    {
      id: "1",
      slug: "next-js-15-rehberi",
      lastModified: "2024-12-01",
    },
    {
      id: "2",
      slug: "react-hooks-kullanimi",
      lastModified: "2024-11-28",
    },
  ].map((post) => ({
    url: `https://bloguygulamam.vercel.app/blog/${post.id}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const categoryPages = [
    "web-gelistirme",
    "react",
    "typescript",
    "javascript",
    "css",
  ].map((category) => ({
    url: `https://bloguygulamam.vercel.app/kategori/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...categoryPages];
}
