import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="border rounded-md">
      <div className="border-b mb-2 rounded-t-md bg-gray-50 px-4 py-2 flex gap-2">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`px-3 py-1 rounded text-sm ${
            !isPreview
              ? "bg-blue-600 text-white cursor-pointer"
              : "text-gray-600 hover:bg-gray-200 cursor-pointer"
          }`}
        >
          Düzenle
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`px-3 py-1 rounded text-sm ${
            isPreview
              ? "bg-blue-600 text-white cursor-pointer"
              : "text-gray-600 hover:bg-gray-200 cursor-pointer"
          }`}
        >
          Önizleme
        </button>
      </div>

      <div className="p-2 md:p-4">
        {!isPreview ? (
          <>
            <div className="flex flex-wrap justify-between items-center gap-8">
              <h2>CodeMirror ile</h2>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? (
                  <p>
                    Açık Mod / <span className="font-bold">Kapalı Mod</span>
                  </p>
                ) : (
                  <p>
                    <span className="font-bold">Açık Mod</span> / Kapalı Mod
                  </p>
                )}
              </button>
            </div>
            <CodeMirror
              value={value}
              height="140px"
              extensions={[markdown()]}
              onChange={(val) => onChange(val)}
              placeholder={placeholder}
              theme={isDark ? "dark" : "light"}
              className="w-full rounded-md border mt-2"
            />

            <h2 className="mt-6">CodeMirror Kullanım Rehberi</h2>
            <div className="prose max-w-none text-sm mt-2 border px-3 py-4 rounded-md overflow-y-auto h-50">
              <h3 className="font-bold border-b mb-2">
                🔤 Metin Biçimlendirme
              </h3>
              <ul className="pl-6 mb-4">
                <li>
                  <code>**kalın**</code> → <strong>kalın</strong>
                </li>
                <li>
                  <code>*italik*</code> → <em>italik</em>
                </li>
                <li>
                  <code>~~üstü çizili~~</code> → <s>üstü çizili</s>
                </li>
                <li>
                  <code>`kod`</code> → <code>kod</code>
                </li>
              </ul>

              <h3 className="font-bold border-b mb-2">🏷️ Başlıklar</h3>
              <pre className="pl-6 mb-4">
                {`# Başlık 1
## Başlık 2
### Başlık 3`}
              </pre>

              <h3 className="font-bold border-b mb-2">📋 Listeler</h3>
              <pre className="pl-6 mb-4">
                {`- Elma
- Armut
- Muz

1. Birinci
2. İkinci
3. Üçüncü`}
              </pre>

              <h3 className="font-bold border-b mb-2">🔗 Link & Görsel</h3>
              <pre className="pl-6 mb-4">[Google](https://google.com)</pre>
              <pre className="pl-6 mb-4">
                ![Resim](https://via.placeholder.com/100)
              </pre>

              <h3 className="font-bold border-b mb-2">📦 Alıntı</h3>
              <pre className="pl-6 mb-4">{"> Bu bir alıntıdır"}</pre>

              <h3 className="font-bold border-b mb-2">💻 Kod Blokları</h3>
              <pre className="pl-6 mb-4">
                {`\`\`\`javascript
function selam() {
  console.log("Merhaba");
}
\`\`\``}
              </pre>

              <h3 className="font-bold border-b mb-2">📊 Tablolar</h3>
              <pre className="pl-6 mb-4">
                {`| Ad   | Yaş |
|------|----:|
| Ali  | 25  |
| Ayşe | 30  |`}
              </pre>

              <h3 className="font-bold border-b mb-2">✅ Görev Listesi</h3>
              <pre className="pl-6 mb-4">
                {`- [x] Tamamlandı
- [ ] Yapılacak`}
              </pre>
            </div>
          </>
        ) : (
          <div className="w-full h-96 overflow-y-auto prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || "*Henüz içerik yok...*"}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
