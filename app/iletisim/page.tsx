import { Metadata } from "next";
import ContactPage from "@/components/Pages/Contact";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Bizimle iletişime geçin. Sorularınız, önerileriniz ve geri bildirimleriniz için.",
  keywords: "iletişim, contact, destek, geri bildirim",
  openGraph: {
    title: "İletişim | Blog Sitesi",
    description: "Bizimle iletişime geçin. Sorularınız ve önerileriniz için.",
    type: "website",
  },
};

export default function Contact() {
  return <ContactPage />;
}
