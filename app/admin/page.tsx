import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUserWithRole } from '@/lib/auth'
import { getFAQs } from '@/lib/database/queries'

export const metadata: Metadata = {
  title: 'Overview — Admin',
}

const shortcuts = [
  {
    label: 'Profil RT',
    icon: '🏘️',
    href: '/admin/profile',
    description: 'Lihat data lengkap RT/RW',
  },
  {
    label: 'FAQ',
    icon: '❓',
    href: '/admin/faqs',
    description: 'Knowledge base untuk AI',
  },
  {
    label: 'Template Surat',
    icon: '📋',
    href: '/admin/letter-templates',
    description: 'Kelola template surat resmi',
  },
  {
    label: 'Permintaan Surat',
    icon: '📄',
    href: '/admin/letter-requests',
    description: 'Review dan approve surat warga',
  },
  {
    label: 'Laporan Keluhan',
    icon: '📢',
    href: '/admin/complaints',
    description: 'Tinjau dan update status keluhan',
  },
  {
    label: 'AI Audit Log',
    icon: '🔍',
    href: '/admin/ai-audit-logs',
    description: 'Riwayat seluruh interaksi AI',
  },
]

export default async function AdminOverviewPage() {
  // getCurrentUserWithRole dicache — tidak ada double round-trip dengan layout
  const currentUser = await getCurrentUserWithRole()
  const faqs = await getFAQs()

  const stats = [
    { label: 'FAQ Aktif', value: String(faqs.length), icon: '❓' },
    { label: 'Surat Menunggu', value: '—', icon: '📄' },
    { label: 'Keluhan Baru', value: '—', icon: '📢' },
    { label: 'Chat Hari Ini', value: '—', icon: '💬' },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Sapaan */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Selamat datang 👋</h1>
        <p className="mt-1 text-gray-500">
          Login sebagai{' '}
          <span className="font-medium text-gray-700">{currentUser?.user.email}</span>
          {currentUser && (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {currentUser.role}
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-title mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <span className="text-3xl opacity-20">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Shortcut cards */}
      <div>
        <p className="section-title mb-4">Menu</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card group flex items-start gap-4 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <span className="text-3xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 group-hover:text-blue-700">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
