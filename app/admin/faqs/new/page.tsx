import type { Metadata } from 'next'
import Link from 'next/link'
import { createFaq } from '@/app/admin/faqs/actions'
import FaqForm from '@/components/admin/FaqForm'

export const metadata: Metadata = {
  title: 'Tambah FAQ — Admin',
}

export default function AdminFaqNewPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/faqs" className="hover:text-gray-700">
          FAQ
        </Link>
        <span>/</span>
        <span className="text-gray-900">Tambah FAQ Baru</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah FAQ</h1>
        <p className="mt-1 text-sm text-gray-500">
          FAQ yang aktif akan langsung tersedia untuk AI menjawab pertanyaan warga.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="card">
          <FaqForm action={createFaq} />
        </div>
      </div>
    </div>
  )
}
