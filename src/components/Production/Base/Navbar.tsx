import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="px-6 py-4 shadow-xl dark:text-white dark:shadow-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-lg font-semibold">
                    <Link href="/">Blog</Link>
                </div>

                <div className="space-x-4 hidden md:block">
                    <Link href="/" className="hover:text-gray-500">Anasayfa</Link>
                </div>

                <div className="space-x-4 hidden md:flex">
                    <Link href="/giris" className="hover:text-gray-500">Giriş Yap</Link>
                    <div className="rotate-15 border"></div>
                    <Link href="/kayit" className="hover:text-gray-500">Kayıt Ol</Link>
                </div>
            </div>
        </nav>
    )
}
