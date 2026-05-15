import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllLetterRequests } from '@/lib/database/queries'
import { formatDateTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Permintaan Surat — Admin',
}

const STATUS_BADGE: Record<string, string> = {
  collecting_data: 'bg-gray-100 text-gray-600',
  waiting_admin_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
}

const STATUS_LABELS: Record<string, string> = {
  collecting_data: 'Mengumpulkan Data',
  waiting_admin_review: 'Menunggu Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  completed: 'Selesai',
}

const LETTER_TYPE_LABELS: Record<string, string> = {
  domisili: 'Surat Keterangan Domisili',
  skck: 'Surat Pengantar SKCK',
  sku: 'Surat Keterangan Usaha (SKU)',
}

export default async function AdminLetterRequestsPage() {
  const requests = await getAllLetterRequests()

  const waiting = requests.filter((r) => r.status === 'waiting_admin_review').length

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permintaan Surat</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review dan approve draft surat yang diajukan warga melalui chat
          </p>
        </div>
        {waiting > 0 && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
            {waiting} menunggu review
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <span className="mb-4 text-5xl">📄</span>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Belum ada permintaan surat</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Permintaan surat akan muncul di sini setelah warga mengajukannya melalui chat.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Jenis Surat
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Dibuat
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {LETTER_TYPE_LABELS[req.letter_type] ?? req.letter_type}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[req.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[req.status] ?? req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(req.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/letter-requests/${req.id}`}
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
