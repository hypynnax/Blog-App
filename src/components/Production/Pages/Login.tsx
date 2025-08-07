'use client'
import { useState } from 'react'
import Link from 'next/link'
import GoogleLoginButton from '@/components/Production/Parts/Button/GoogleLoginButton'
import GithubLoginButton from '@/components/Production/Parts/Button/GithubLoginButton'
import MicrosoftLoginButton from '@/components/Production/Parts/Button/MicrosoftLoginButton'
import TwitterLoginButton from '@/components/Production/Parts/Button/TwitterLoginButton'
import { emailIcon, passwordIcon } from '@/icons/icon'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // API entegrasyonu buraya gelecek
        console.log({ email, password })
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 space-y-6">
                <h2 className="text-2xl font-bold text-center">
                    Giriş Yap
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-md mb-2 font-bold">Email</label>
                        <div className="mt-1 w-full flex justify-start items-center gap-2 px-4 py-2 border rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
                            {emailIcon}
                            <input
                                type="email"
                                required
                                className="w-full p-1 outline-none"
                                value={email}
                                placeholder='E-postanızı girin'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-md mb-2 font-bold">Şifre</label>
                        <div className="mt-1 w-full flex justify-start items-center gap-2 px-4 py-2 border rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
                            {passwordIcon}
                            <input
                                type="password"
                                required
                                className="w-full p-1 outline-none"
                                value={password}
                                placeholder='Şifrenizi girin'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex justify-between items-center gap-1">
                            <input type="checkbox" id="rememberMe" className="cursor-pointer" />
                            <label htmlFor="rememberMe" className="cursor-pointer">Beni Hatırla</label>
                        </div>

                        <span className="font-medium text-blue-500 cursor-pointer">Parolanızı mı unuttunuz?</span>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
                    >
                        Giriş Yap
                    </button>
                </form>

                <div className='relative w-full border border-gray-400'><p className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2'>VEYA</p></div>

                <div className='flex flex-wrap justify-between items-center gap-4'>
                    <GoogleLoginButton />
                    <GithubLoginButton />
                    <MicrosoftLoginButton />
                    <TwitterLoginButton />
                </div>

                <p className="text-center text-sm text-black">
                    Hesabın yok mu?{' '}
                    <Link href="/kayit" className="text-blue-600 hover:underline">
                        Kayıt Ol
                    </Link>
                </p>
            </div>
        </div>
    )
}
