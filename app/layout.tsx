import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AsistenRT',
    template: '%s | AsistenRT',
  },
  description:
    'Platform digital untuk membantu administrasi RT/RW berbasis AI. Jawab pertanyaan warga, proses surat, dan kelola laporan keluhan.',
  keywords: ['RT', 'RW', 'administrasi', 'AI', 'surat pengantar', 'keluhan'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
