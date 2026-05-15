import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Beranda',
}

const features = [
  {
    icon: '💬',
    title: 'Tanya Jawab Otomatis',
    description:
      'AI menjawab pertanyaan warga berdasarkan knowledge base RT. Tersedia 24 jam.',
  },
  {
    icon: '📄',
    title: 'Permintaan Surat',
    description:
      'Warga bisa meminta draft surat pengantar lewat chat. Admin RT tetap yang menyetujui.',
  },
  {
    icon: '📢',
    title: 'Laporan Keluhan',
    description:
      'Warga melaporkan masalah lingkungan. AI mengekstrak informasi, admin menindaklanjuti.',
  },
  {
    icon: '🔐',
    title: 'Admin Panel',
    description:
      'Dashboard khusus admin RT untuk mengelola FAQ, surat, keluhan, dan profil RT.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="landing" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5">
              <span className="text-sm font-medium text-blue-800">MVP v1 — Dalam Pengembangan</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Asisten Digital untuk{' '}
              <span className="text-blue-600">RT/RW Anda</span>
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-gray-600">
              AsistenRT membantu pengurus dan warga RT/RW dalam administrasi sehari-hari.
              Tanya FAQ, minta surat pengantar, dan laporan keluhan — semua lewat satu platform.
              Keputusan resmi tetap di tangan pengurus RT.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span>💬</span>
                Chat Warga
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <span>🔐</span>
                Panel Admin RT
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="section-title mb-2">Fitur Utama</p>
              <h2 className="text-3xl font-bold text-gray-900">
                Semua yang dibutuhkan RT Anda
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="card text-center">
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Disclaimer Section */}
        <section className="bg-amber-50 py-12">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="text-2xl mb-3">⚖️</p>
            <h2 className="mb-3 text-xl font-semibold text-amber-900">
              AI Membantu, Manusia yang Memutuskan
            </h2>
            <p className="text-sm leading-relaxed text-amber-800">
              Semua respons AI bersifat informatif dan tidak mengikat secara hukum.
              Setiap surat, keputusan administratif, dan tindakan resmi tetap memerlukan
              persetujuan pengurus RT yang berwenang.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
