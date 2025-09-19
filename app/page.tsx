import { Metadata } from "next";
import Home from "@/components/Pages/Home";

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description:
    "Teknoloji, web geliştirme ve programlama hakkında güncel yazılar. Next.js, React, TypeScript ve daha fazlası.",
  keywords:
    "blog, teknoloji, web geliştirme, programlama, next.js, react, typescript",
  openGraph: {
    title: "Ana Sayfa | Blog Sitesi",
    description:
      "Teknoloji, web geliştirme ve programlama hakkında güncel yazılar.",
    type: "website",
  },
};

export default function page() {
  return <Home />;
}
