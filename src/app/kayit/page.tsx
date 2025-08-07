import { Metadata } from "next";
import Register from "@/components/Production/Pages/Register";

export const metadata: Metadata = {
    title: "Kayıt Sayfası | Blog Sitesi",
    description: "Blog Hesabı Oluşturun",
};

export default function page() {
    return (
        <Register />
    )
}
