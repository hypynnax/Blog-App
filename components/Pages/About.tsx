export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-md shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Hakkımızda</h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Teknoloji dünyasındaki gelişmeleri takip etmek ve paylaşmak
              amacıyla kurulmuş bir platform olan blogumuzda, web geliştirme,
              programlama ve teknoloji alanlarında güncel içerikler
              bulabilirsiniz.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Misyonumuz
            </h2>
            <p className="text-gray-700 mb-6">
              Türkçe teknoloji içeriğinin kalitesini artırmak ve yazılım
              geliştirme topluluğuna faydalı kaynaklar sunmak ana hedefimizdir.
              Başlangıç seviyesinden ileri seviyeye kadar her geliştiriciye
              hitap eden içerikler üretiyoruz.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ekibimiz</h2>
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  NK
                </div>
                <h3 className="text-xl font-bold mb-2">Nurullah KARA</h3>
                <p className="text-gray-600">Full-stack Developer</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">İletişim</h2>
            <p className="text-gray-700">
              Bizimle iletişime geçmek, görüşlerinizi paylaşmak veya işbirliği
              teklifleriniz için
              <a
                href="/iletisim"
                className="text-blue-600 hover:underline ml-1"
              >
                iletişim sayfamızı
              </a>{" "}
              ziyaret edebilirsiniz.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
