import { Metadata } from "next";
import Login from "@/components/Production/Pages/Login";

export const metadata: Metadata = {
    title: "Giriş Sayfası | Blog Sitesi",
    description: "Blog Hesabınıza Giriş Yapın",
};

export default function page() {
    return (
        <Login />
    )
}
