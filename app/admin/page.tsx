import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth'
import { getRTProfile, getFAQs } from '@/lib/database/queries'
import { formatDate } from '@/lib/utils'
import type { RtRow, FaqRow } from '@/lib/database/types'

export const metadata: Metadata = {
  title: 'Dashboard Admin',
}

const navItems = [
  { label: 'Profil RT', icon: '🏘️', description: 'Kelola data RT/RW' },
  { label: 'Kelola FAQ', icon: '❓', description: 'Tambah & edit knowledge base' },
  { label: 'Persetujuan Surat', icon: '📄', description: 'Review & approve surat warga' },
  { label: 'Laporan Keluhan', icon: '📢', description: 'Tinjau & update keluhan' },
  { label: 'AI Audit Log', icon: '🔍', description: 'Riwayat interaksi AI' },
  { label: 'Pengaturan', icon: '⚙️', description: 'Konfigurasi sistem' },
]

// ─── Sub-komponen ────────────────────────────────────────────────────────────

function DbNotConfiguredBanner() {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-start gap-3">
        <span className="text-xl">🔌</span>
        <div>
          <p className="font-semibold text-gray-700">Database belum dikonfigurasi</p>
          <p className="mt-1 text-sm text-gray-500">
            Supabase URL dan API key belum diisi di{' '}
            <code className="rounded bg-gray-200 px-1 py-0.5 text-xs">.env.local</code>.
            Lihat{' '}
            <code className="rounded bg-gray-200 px-1 py-0.5 text-xs">docs/SUPABASE_SETUP.md</code>{' '}
            untuk panduan setup.
          </p>
        </div>
      </div>
    </div>
  )
}

function RTProfileCard({ rt }: { rt: RtRow }) {
  const rows = [
    { label: 'Nama RT', value: rt.name },
    { label: 'RW', value: rt.rw },
    { label: 'Area', value: rt.area_name },
    { label: 'Kelurahan', value: rt.kelurahan },
    { label: 'Kecamatan', value: rt.kecamatan },
    { label: 'Kota', value: rt.city },
    { label: 'Ketua RT', value: rt.chairman_name },
    { label: 'Sekretaris', value: rt.secretary_name },
    { label: 'Bendahara', value: rt.treasurer_name },
    { label: 'Kontak Keamanan', value: rt.security_contact },
  ]

  return (
    <div className="card mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Profil RT</h2>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Terhubung
        </span>
      </div>
      <dl className="grid gap-y-3 sm:grid-cols-2">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-gray-800">
              {value ?? <span className="text-gray-300">—</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-gray-400">Dibuat: {formatDate(rt.created_at)}</p>
    </div>
  )
}

function RTProfileEmpty() {
  return (
    <div className="card mb-6">
      <div className="flex items-center gap-3 text-gray-400">
        <span className="text-2xl">🏘️</span>
        <div>
          <p className="font-medium text-gray-600">Data RT tidak ditemukan</p>
          <p className="text-sm">Pastikan migration dan seed SQL sudah dijalankan di Supabase.</p>
        </div>
      </div>
    </div>
  )
}

function FAQSection({ faqs }: { faqs: FaqRow[] }) {
  if (faqs.length === 0) {
    return (
      <div className="card mb-6">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="text-2xl">❓</span>
          <div>
            <p className="font-medium text-gray-600">Belum ada FAQ</p>
            <p className="text-sm">Seed SQL mungkin belum dijalankan.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-6">
      <h2 className="mb-4 font-semibold text-gray-900">
        FAQ Aktif{' '}
        <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {faqs.length}
        </span>
      </h2>
      <ul className="space-y-3">
        {faqs.map((faq) => (
          <li key={faq.id} className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-800">{faq.question}</p>
            <p className="mt-1 text-sm text-gray-500">{faq.answer}</p>
            {faq.category && (
              <span className="mt-2 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                {faq.category}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  // Auth check — middleware sudah redirect jika belum login,
  // tapi double-check di sini untuk keamanan berlapis.
  const currentUser = await getCurrentUserWithRole()

  if (!currentUser) {
    redirect('/login')
  }

  // Role guard — warga tidak boleh masuk panel admin.
  if (currentUser.role === 'warga') {
    redirect('/unauthorized')
  }

  const configured = isSupabaseConfigured()

  const [rtProfile, faqs] = await Promise.all([getRTProfile(), getFAQs()])

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="admin" userName={currentUser.user.email} />

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="mt-1 text-gray-500">
              Login sebagai{' '}
              <span className="font-medium text-gray-700">{currentUser.user.email}</span>
              {' '}—{' '}
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                {currentUser.role}
              </span>
            </p>
          </div>

          {/* Status koneksi database */}
          {!configured && <DbNotConfiguredBanner />}

          {/* Profil RT */}
          {configured && (rtProfile ? <RTProfileCard rt={rtProfile} /> : <RTProfileEmpty />)}

          {/* FAQ */}
          {configured && <FAQSection faqs={faqs} />}

          {/* Stats ringkasan */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'FAQ Aktif', value: configured ? String(faqs.length) : '—', icon: '❓' },
              { label: 'Surat Menunggu', value: '—', icon: '📄' },
              { label: 'Keluhan Baru', value: '—', icon: '📢' },
              { label: 'Chat Hari Ini', value: '—', icon: '💬' },
            ].map((stat) => (
              <div key={stat.label} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="section-title mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-700">{stat.value}</p>
                  </div>
                  <span className="text-3xl opacity-20">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Fitur coming soon */}
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
                  <p className="mt-3 text-xs text-gray-400">🔒 Segera tersedia</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
              &larr; Kembali ke Beranda
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
