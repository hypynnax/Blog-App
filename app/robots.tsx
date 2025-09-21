import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/profil/",
        "/yazilarim/",
        "/yazi-olustur/",
        "/yazi-duzenle/",
        "/giris/",
        "/kayit/",
        "/sifremi-unuttum/",
        "/sifre-sifirla/",
      ],
    },
    sitemap: "http://localhost:3000/sitemap.xml",
  };
}
