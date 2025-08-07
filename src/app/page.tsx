import { Metadata } from "next";
import Navbar from "@/components/Production/Base/Navbar";

export const metadata: Metadata = {
    title: "Ana Sayfa | Blog Sitesi",
    description: "Blog Yazmaya Başlayın",
};

export default function Home() {
    return (
        <>
            <Navbar />
        </>
    );
}
