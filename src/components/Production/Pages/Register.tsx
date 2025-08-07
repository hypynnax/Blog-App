'use client'
import { useState } from 'react'
import Link from 'next/link'
import { hiddenPasswordIcon, showPasswordIcon } from '@/icons/icon'

export default function page() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: '',
        passwordConfirm: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    // Telefon numarasını formatla
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Sadece rakamları al

        if (value.length <= 3) {
            value = value.replace(/(\d{1,3})/, '($1'); // İlk 3 rakam parantez içine
        } else if (value.length <= 6) {
            value = value.replace(/(\d{3})(\d{1,3})/, '($1) $2'); // Sonraki 3 rakamı boşlukla ayır
        } else if (value.length <= 8) {
            value = value.replace(/(\d{3})(\d{3})(\d{1,2})/, '($1) $2 $3'); // Sonraki 2 rakamı boşlukla ayır
        } else if (value.length <= 10) {
            value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{1,2})/, '($1) $2 $3 $4'); // Sonraki 2 rakamı da ayır
        } else {
            value = value.slice(0, 10); // Maksimum 10 haneli numara (şu an 10 karaktere kadar izin veriyoruz)
            value = value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '($1) $2 $3 $4'); // Son 4 haneyi ikiye ayır
        }

        setFormData({ ...formData, phone: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const { name, surname, phone, email, password, passwordConfirm } = formData

        // Şifreler uyuşuyor mu kontrolü
        if (password !== passwordConfirm) {
            setError('Şifreler uyuşmuyor!')
            return
        }

        // Tüm form başarılıysa
        setError('')
        alert(`Kayıt Başarılı: ${email}, ${password}`)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-md p-8 space-y-6">
                <h2 className="text-2xl font-bold text-center">
                    Kayıt Ol
                </h2>

                <form className="space-y-2" onSubmit={handleSubmit}>
                    {/* İsim ve Soyisim */}
                    <div className='flex flex-col justify-center items-center gap-2'>
                        <div className='w-full'>
                            <label className="block text-sm font-medium">İsim</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder='İsminizi Girin'
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='w-full'>
                            <label className="block text-sm font-medium">Soyisim</label>
                            <input
                                type="text"
                                name="surname"
                                required
                                className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder='Soyisminizi Girin'
                                value={formData.surname}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Telefon ve Email */}
                    <div className='flex flex-col justify-center items-center gap-2'>
                        <div className='w-full'>
                            <label className="block text-sm font-medium">Telefon</label>
                            <input
                                type="text"
                                name="phone"
                                required
                                className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder='(5XX) XXX XX XX'
                                value={formData.phone}
                                onChange={handlePhoneChange}
                            />
                        </div>

                        <div className='w-full'>
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder='E-postanızı Girin'
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Şifreler */}
                    <div className='flex flex-col justify-center items-center gap-2'>
                        <div className='w-full'>
                            <label className="block text-sm font-medium">Şifre</label>
                            <div className='relative flex justify-center items-center gap-2 mt-1'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder='Şirenizi Girin'
                                    minLength={6}
                                    maxLength={21}
                                    value={formData.password}
                                    onChange={handleChange}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute top-1/2 -translate-y-[50%] right-2 text-blue-500 hover:underline text-sm cursor-pointer"
                                >
                                    {showPassword ? hiddenPasswordIcon : showPasswordIcon}
                                </button>
                            </div>
                        </div>

                        <div className='w-full'>
                            <label className="block text-sm font-medium">Şifre Doğrulama</label>
                            <div className='relative flex justify-center items-center gap-2 mt-1'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="passwordConfirm"
                                    required
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder='Şirenizi Tekrar Girin'
                                    minLength={6}
                                    maxLength={21}
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-2 text-blue-500 hover:underline text-sm cursor-pointer"
                                >
                                    {showPassword ? hiddenPasswordIcon : showPasswordIcon}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-center mt-5">{error}</div>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition cursor-pointer mt-5"
                    >
                        Kayıt Ol
                    </button>
                </form>

                <p className="text-center text-sm text-black">
                    Zaten hesabın var mı?{' '}
                    <Link href="/giris" className="text-blue-600 hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    )
}
