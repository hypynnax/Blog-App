import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/profil/",
        "/yazılarım/",
        "/yazi-olustur/",
        "/yazi-duzenle/",
        "/giris/",
        "/kayit/",
      ],
    },
    sitemap: "https://yourblog.com/sitemap.xml",
  };
}
