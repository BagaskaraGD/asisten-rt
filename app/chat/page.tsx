import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Chat Warga',
}

const suggestedQuestions = [
  'Iuran bulan ini berapa?',
  'Bagaimana cara membuat surat pengantar SKCK?',
  'Jadwal rapat RT berikutnya kapan?',
  'Saya mau laporkan lampu jalan yang mati.',
]

export default function ChatPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header variant="warga" />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <main className="flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">AsistenRT AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                  <p className="text-xs text-gray-400">Belum aktif — segera hadir</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {/* System / Welcome message */}
              <div className="flex justify-center">
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                  <p className="text-sm font-medium text-amber-900">🚧 Chat Simulator — Dalam Pengembangan</p>
                  <p className="mt-1 text-xs text-amber-700">
                    Fitur AI chat akan tersedia setelah integrasi LLM dan database selesai.
                  </p>
                </div>
              </div>

              {/* Assistant greeting bubble */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="max-w-sm rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-800">
                    Halo! Saya AsistenRT, asisten administrasi RT/RW Anda. Saya bisa membantu
                    menjawab pertanyaan seputar RT, memproses permintaan surat, dan menerima
                    laporan keluhan.
                  </p>
                  <p className="mt-2 text-sm text-gray-800">Ada yang bisa saya bantu?</p>
                  <p className="mt-1 text-xs text-gray-400">Placeholder — belum terhubung ke AI</p>
                </div>
              </div>

              {/* Example user message */}
              <div className="flex justify-end gap-3">
                <div className="max-w-sm rounded-2xl rounded-tr-none bg-blue-600 px-4 py-3">
                  <p className="text-sm text-white">Iuran bulan ini berapa?</p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-sm">👤</span>
                </div>
              </div>

              {/* Example assistant response */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="max-w-sm rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-800">
                    [Contoh respons] Iuran RT bulan ini adalah Rp 50.000 per KK,
                    dibayarkan paling lambat tanggal 10 setiap bulannya.
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    📚 Sumber: FAQ RT — Contoh saja, bukan data nyata
                  </p>
                </div>
              </div>

              {/* Suggested questions */}
              <div className="pt-4">
                <p className="mb-3 text-center text-xs text-gray-400">Pertanyaan yang sering diajukan:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      disabled
                      className="cursor-not-allowed rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-400 shadow-sm"
                      title="Fitur belum aktif"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-end gap-3">
                <div className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-400">
                    Chat AI belum aktif — akan tersedia setelah integrasi selesai
                  </p>
                </div>
                <button
                  disabled
                  className="flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-gray-100 text-gray-300"
                  title="Chat belum aktif"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">
                ⚖️ Respons AI bersifat informatif. Keputusan resmi tetap di pengurus RT.
              </p>
            </div>
          </div>
        </main>

        {/* Info Sidebar */}
        <aside className="hidden w-64 border-l border-gray-200 bg-white p-5 lg:block">
          <p className="section-title mb-4">Informasi</p>

          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Yang bisa saya bantu:</p>
              <ul className="space-y-1">
                {['Tanya FAQ RT', 'Minta draft surat', 'Lapor keluhan', 'Cek status pengajuan'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="h-1 w-1 rounded-full bg-blue-400"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Perlu diingat:</p>
              <p className="text-xs text-amber-700">
                AI hanya membantu. Surat dan keputusan resmi tetap memerlukan tanda tangan pengurus RT.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Jenis surat:</p>
              <ul className="space-y-1">
                {['Surat Keterangan Domisili', 'Pengantar SKCK', 'Keterangan Tidak Mampu', 'Pengantar Nikah'].map((item) => (
                  <li key={item} className="text-xs text-gray-400">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
