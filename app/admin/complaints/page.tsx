import type { Metadata } from 'next'
import Link from 'next/link'
import { getComplaintReports } from '@/lib/database/queries'
import { formatDateTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Laporan Keluhan — Admin',
}

const CATEGORY_LABELS: Record<string, string> = {
  fasilitas_umum: 'Fasilitas Umum',
  keamanan: 'Keamanan',
  kebersihan: 'Kebersihan',
  administrasi: 'Administrasi',
  sosial: 'Sosial',
  lainnya: 'Lainnya',
}

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-600 text-white',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Laporan Baru',
  in_review: 'Sedang Ditinjau',
  in_progress: 'Sedang Diproses',
  resolved: 'Selesai',
  rejected: 'Ditolak',
}

const URGENCY_BADGE: Record<string, string> = {
  tinggi: 'bg-red-100 text-red-800',
  sedang: 'bg-yellow-100 text-yellow-700',
  rendah: 'bg-gray-100 text-gray-600',
}

export default async function AdminComplaintsPage() {
  const complaints = await getComplaintReports()
  const newCount = complaints.filter((c) => c.status === 'new').length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keluhan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tinjau keluhan warga dan update status penanganannya
          </p>
        </div>
        {newCount > 0 && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
            {newCount} laporan baru
          </span>
        )}
      </div>

      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <span className="mb-4 text-5xl">📢</span>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Belum ada laporan keluhan</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Laporan keluhan akan muncul di sini setelah warga melaporkan melalui chat.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Urgensi
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Lokasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Masuk
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {CATEGORY_LABELS[complaint.category] ?? complaint.category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        URGENCY_BADGE[complaint.urgency ?? 'sedang'] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {complaint.urgency ?? 'sedang'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {complaint.location ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[complaint.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[complaint.status] ?? complaint.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(complaint.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/complaints/${complaint.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Lihat Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
