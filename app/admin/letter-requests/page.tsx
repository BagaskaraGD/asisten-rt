import type { Metadata } from 'next'
import ComingSoonCard from '@/components/admin/ComingSoonCard'

export const metadata: Metadata = {
  title: 'Permintaan Surat — Admin',
}

export default function AdminLetterRequestsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Permintaan Surat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review dan approve draft surat yang diajukan warga melalui chat
        </p>
      </div>
      <ComingSoonCard
        icon="📄"
        title="Permintaan Surat belum tersedia"
        description="Fitur review, approve, dan reject surat warga akan tersedia setelah integrasi chat simulator dan AI selesai."
      />
    </div>
  )
}
