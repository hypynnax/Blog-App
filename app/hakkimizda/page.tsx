import { Metadata } from "next";
import AboutPage from "@/components/Pages/About";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Blog hakkında bilgi edinin. Ekibimiz, misyonumuz ve vizyonumuz.",
  keywords: "hakkımızda, blog ekibi, misyon, vizyon",
  openGraph: {
    title: "Hakkımızda | Blog Sitesi",
    description:
      "Blog hakkında bilgi edinin. Ekibimiz, misyonumuz ve vizyonumuz.",
    type: "website",
  },
};

export default function About() {
  return <AboutPage />;
}
