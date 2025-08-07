import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
    title: "Blog Sitesi",
    description: "Blog Sitemizi Ziyaret Edin",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body>
                {children}
            </body>
        </html>
    );
}
