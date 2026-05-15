import type { Metadata } from 'next'
import ComingSoonCard from '@/components/admin/ComingSoonCard'

export const metadata: Metadata = {
  title: 'Template Surat — Admin',
}

export default function AdminLetterTemplatesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Template Surat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola template surat resmi yang digunakan AI untuk membuat draft
        </p>
      </div>
      <ComingSoonCard
        icon="📋"
        title="Template Surat belum tersedia"
        description="Fitur kelola template surat (domisili, SKCK, keterangan tidak mampu, dll) akan tersedia setelah fitur dasar selesai."
      />
    </div>
  )
}
