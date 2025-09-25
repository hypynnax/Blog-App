"use client";
import { useState } from "react";
import {
  addressIcon,
  emailIcon,
  facebookSocialIcon,
  githubSocialIcon,
  instagramSocialIcon,
  linkedinSocialIcon,
  oclockIcon,
  webIcon,
  xSocialIcon,
} from "@/icons/icon";
import toast from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mesajınız başarıyla gönderildi!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-md shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">İletişim</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                Bizimle İletişime Geçin
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">İsim</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Adınızı girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E-posta adresinizi girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Konu</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Konu seçin</option>
                    <option value="genel">Genel Sorular</option>
                    <option value="teknik">Teknik Destek</option>
                    <option value="isbirligi">İşbirliği</option>
                    <option value="geri-bildirim">Geri Bildirim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mesaj
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Mesajınızı yazın..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition cursor-pointer"
                >
                  Mesaj Gönder
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-xl font-bold mb-4">İletişim Bilgileri</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {emailIcon}
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">
                      nurullahkarailetisim@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {addressIcon}
                  </div>
                  <div>
                    <p className="font-medium">Adres</p>
                    <p className="text-gray-600">İstanbul, Türkiye</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {oclockIcon}
                  </div>
                  <div>
                    <p className="font-medium">Çalışma Saatleri</p>
                    <p className="text-gray-600">
                      Pazartesi - Cuma: 10:00 - 17:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Sosyal Medya</h3>
                <div className="flex gap-4 flex-wrap">
                  <a
                    href="https://www.instagram.com/hypynnax/#"
                    target="_blank"
                    className="w-8 h-8 flex items-center justify-center transition"
                  >
                    {instagramSocialIcon}
                  </a>
                  <a
                    href="https://www.facebook.com/hypynnax"
                    target="_blank"
                    className="w-8 h-8 flex items-center justify-center transition"
                  >
                    {facebookSocialIcon}
                  </a>
                  <a
                    href="https://x.com/lhypynnax"
                    target="_blank"
                    className="w-8 h-8 flex items-center justify-center transition bg-white rounded-md p-[1px]"
                  >
                    {xSocialIcon}
                  </a>
                  <a
                    href="https://www.linkedin.com/in/nurullahkara"
                    target="_blank"
                    className="w-8 h-8 flex items-center justify-center transition"
                  >
                    {linkedinSocialIcon}
                  </a>
                  <a
                    href="https://github.com/hypynnax"
                    target="_blank"
                    className="w-8 h-8 flex items-center justify-center transition"
                  >
                    {githubSocialIcon}
                  </a>
                  <a
                    href="https://nurullahkara.vercel.app/"
                    target="_blank"
                    className="w-8 h-8 flex items-center justify-center transition"
                  >
                    {webIcon}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
