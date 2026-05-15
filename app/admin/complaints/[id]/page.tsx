import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getComplaintReport } from '@/lib/database/queries'
import { updateComplaintStatus } from '@/app/admin/complaints/actions'
import { formatDateTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Detail Laporan — Admin',
}

type Props = { params: Promise<{ id: string }> }

const CATEGORY_LABELS: Record<string, string> = {
  fasilitas_umum: 'Fasilitas Umum',
  keamanan: 'Keamanan',
  kebersihan: 'Kebersihan',
  administrasi: 'Administrasi',
  sosial: 'Sosial',
  lainnya: 'Lainnya',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Laporan Baru',
  in_review: 'Sedang Ditinjau',
  in_progress: 'Sedang Diproses',
  resolved: 'Selesai',
  rejected: 'Ditolak',
}

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-600 text-white',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const URGENCY_BADGE: Record<string, string> = {
  tinggi: 'bg-red-100 text-red-800',
  sedang: 'bg-yellow-100 text-yellow-700',
  rendah: 'bg-gray-100 text-gray-600',
}

const FINAL_STATUSES = ['resolved', 'rejected']

export default async function AdminComplaintDetailPage({ params }: Props) {
  const { id } = await params
  const complaint = await getComplaintReport(id)

  if (!complaint) notFound()

  const isFinal = FINAL_STATUSES.includes(complaint.status)
  const updateWithId = updateComplaintStatus.bind(null, id)

  const statusBadge = STATUS_BADGE[complaint.status] ?? 'bg-gray-100 text-gray-600'
  const urgencyBadge = URGENCY_BADGE[complaint.urgency ?? 'sedang'] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/complaints" className="hover:text-gray-700">
          Laporan Keluhan
        </Link>
        <span>/</span>
        <span className="text-gray-900">Detail</span>
      </nav>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {CATEGORY_LABELS[complaint.category] ?? complaint.category}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Masuk: {formatDateTime(complaint.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyBadge}`}>
            Urgensi: {complaint.urgency ?? 'sedang'}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${statusBadge}`}>
            {STATUS_LABELS[complaint.status] ?? complaint.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Detail laporan */}
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-900">Detail Laporan</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-gray-400">Deskripsi Asli (dari warga)</dt>
              <dd className="mt-1.5 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-800">
                {complaint.description}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-400">Kategori</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-800">
                  {CATEGORY_LABELS[complaint.category] ?? complaint.category}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Urgensi</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-800">
                  {complaint.urgency ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Lokasi</dt>
                <dd className="mt-0.5 text-sm font-medium text-gray-800">
                  {complaint.location ?? <span className="text-gray-400">Tidak disebutkan</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">ID Laporan</dt>
                <dd className="mt-0.5 font-mono text-xs text-gray-500">
                  {complaint.id.slice(0, 8).toUpperCase()}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Update status */}
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-900">
            {isFinal ? 'Status Final' : 'Update Status'}
          </h2>

          {isFinal ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800">
                  {STATUS_LABELS[complaint.status]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Catatan Admin</p>
                <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {complaint.admin_notes ?? 'Tidak ada catatan.'}
                </p>
              </div>
            </div>
          ) : (
            <form action={updateWithId} className="space-y-4">
              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Status Baru
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={complaint.status}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="new">Laporan Baru</option>
                  <option value="in_review">Sedang Ditinjau</option>
                  <option value="in_progress">Sedang Diproses</option>
                  <option value="resolved">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Catatan Admin{' '}
                  <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  defaultValue={complaint.admin_notes ?? ''}
                  placeholder="Contoh: Sudah dikoordinasikan dengan petugas kebersihan, akan ditangani Kamis."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Simpan Status
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/complaints" className="text-sm text-gray-400 hover:text-gray-600">
          ← Kembali ke daftar laporan
        </Link>
      </div>
    </div>
  )
}
