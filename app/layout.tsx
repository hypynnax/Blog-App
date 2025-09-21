import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import ConditionalNavbar from "@/components/Base/ConditionalNavbar";
import ConditionalFooter from "@/components/Base/ConditionalFooter";
import { Toaster } from "react-hot-toast";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Blog | Teknoloji ve Web Geliştirme",
    template: "%s | Blog Sitesi",
  },
  description:
    "Teknoloji, web geliştirme ve programlama hakkında güncel blog yazıları.",
  keywords:
    "blog, teknoloji, web geliştirme, programlama, next.js, react, typescript",
  authors: [{ name: "Nurullah KARA" }],
  creator: "Hypynnax",
  publisher: "Hypynnax",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "http://localhost:3000",
    siteName: "Blog",
    title: "Blog | Teknoloji ve Web Geliştirme",
    description:
      "Teknoloji, web geliştirme ve programlama hakkında güncel blog yazıları.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Teknoloji ve Web Geliştirme",
    description:
      "Teknoloji, web geliştirme ve programlama hakkında güncel blog yazıları.",
    creator: "@yourblog",
  },
  alternates: {
    canonical: "http://localhost:3000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ConditionalNavbar />
          <main className="flex-1 w-full">{children}</main>
          <ConditionalFooter />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                style: {
                  background: "#10b981",
                  color: "#fff",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
