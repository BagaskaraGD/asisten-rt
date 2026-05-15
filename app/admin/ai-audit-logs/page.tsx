import type { Metadata } from 'next'
import ComingSoonCard from '@/components/admin/ComingSoonCard'

export const metadata: Metadata = {
  title: 'AI Audit Log — Admin',
}

export default function AdminAiAuditLogsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Audit Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Riwayat seluruh interaksi AI — input warga, intent terdeteksi, dan respons yang diberikan
        </p>
      </div>
      <ComingSoonCard
        icon="🔍"
        title="AI Audit Log belum tersedia"
        description="Log interaksi AI akan mulai tercatat setelah integrasi LLM aktif. Setiap respons AI dicatat untuk keperluan transparansi dan debugging."
      />
    </div>
  )
}
