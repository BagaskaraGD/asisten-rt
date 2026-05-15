import type { Metadata } from 'next'
import ComingSoonCard from '@/components/admin/ComingSoonCard'

export const metadata: Metadata = {
  title: 'Laporan Keluhan — Admin',
}

export default function AdminComplaintsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Keluhan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tinjau keluhan warga dan update status penanganannya
        </p>
      </div>
      <ComingSoonCard
        icon="📢"
        title="Laporan Keluhan belum tersedia"
        description="Fitur lihat dan update status keluhan warga (baru, sedang ditinjau, diproses, selesai) akan tersedia setelah chat simulator aktif."
      />
    </div>
  )
}
