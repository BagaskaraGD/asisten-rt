import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Dashboard Admin',
}

const navItems = [
  { label: 'Profil RT', icon: '🏘️', href: '#', description: 'Kelola data RT/RW', status: 'coming_soon' },
  { label: 'Kelola FAQ', icon: '❓', href: '#', description: 'Tambah & edit knowledge base', status: 'coming_soon' },
  { label: 'Persetujuan Surat', icon: '📄', href: '#', description: 'Review & approve surat warga', status: 'coming_soon' },
  { label: 'Laporan Keluhan', icon: '📢', href: '#', description: 'Tinjau & update keluhan', status: 'coming_soon' },
  { label: 'AI Audit Log', icon: '🔍', href: '#', description: 'Riwayat interaksi AI', status: 'coming_soon' },
  { label: 'Pengaturan', icon: '⚙️', href: '#', description: 'Konfigurasi sistem', status: 'coming_soon' },
]

const stats = [
  { label: 'FAQ Aktif', value: '—', icon: '❓' },
  { label: 'Surat Menunggu', value: '—', icon: '📄' },
  { label: 'Keluhan Baru', value: '—', icon: '📢' },
  { label: 'Chat Hari Ini', value: '—', icon: '💬' },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="admin" />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-gray-200 bg-gray-50 lg:block">
          <nav className="p-4">
            <p className="section-title mb-3 px-2">Menu Admin</p>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-gray-400">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                    <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                      Segera
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="mt-1 text-gray-500">
              Selamat datang di panel administrasi AsistenRT.
            </p>
          </div>

          {/* Under Construction Notice */}
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">🚧</span>
              <div>
                <p className="font-semibold text-amber-900">Dalam Pengembangan</p>
                <p className="mt-1 text-sm text-amber-800">
                  Dashboard admin sedang dalam proses pengembangan. Fitur-fitur akan tersedia
                  setelah setup database dan autentikasi selesai.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="section-title mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-400">{stat.value}</p>
                  </div>
                  <span className="text-3xl opacity-30">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div>
            <p className="section-title mb-4">Fitur yang akan datang</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {navItems.map((item) => (
                <div key={item.label} className="card opacity-60">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-semibold text-gray-700">{item.label}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="mt-3 text-xs text-gray-400">🔒 Memerlukan autentikasi admin</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
