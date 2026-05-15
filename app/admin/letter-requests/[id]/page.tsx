import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLetterRequest } from '@/lib/database/queries'
import { approveLetter, rejectLetter } from '@/app/admin/letter-requests/actions'
import { formatDateTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Detail Surat — Admin',
}

type Props = { params: Promise<{ id: string }> }

const STATUS_BADGE: Record<string, string> = {
  collecting_data: 'bg-gray-100 text-gray-600',
  waiting_admin_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
}

const STATUS_LABELS: Record<string, string> = {
  collecting_data: 'Mengumpulkan Data',
  waiting_admin_review: 'Menunggu Review Admin',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  completed: 'Selesai',
}

const LETTER_TYPE_LABELS: Record<string, string> = {
  domisili: 'Surat Keterangan Domisili',
  skck: 'Surat Pengantar SKCK',
  sku: 'Surat Keterangan Usaha (SKU)',
}

const FIELD_LABELS: Record<string, string> = {
  nama_lengkap: 'Nama Lengkap',
  nik: 'NIK',
  nomor_kk: 'Nomor KK',
  alamat: 'Alamat',
  keperluan: 'Keperluan',
  tempat_lahir: 'Tempat Lahir',
  tanggal_lahir: 'Tanggal Lahir',
  jenis_kelamin: 'Jenis Kelamin',
  agama: 'Agama',
  pekerjaan: 'Pekerjaan',
  nama_usaha: 'Nama Usaha',
  jenis_usaha: 'Jenis Usaha',
  alamat_usaha: 'Alamat Usaha',
}

export default async function AdminLetterDetailPage({ params }: Props) {
  const { id } = await params
  const request = await getLetterRequest(id)

  if (!request) notFound()

  const approveWithId = approveLetter.bind(null, id)
  const rejectWithId = rejectLetter.bind(null, id)

  const formDataEntries = Object.entries(request.form_data)
  const statusBadge = STATUS_BADGE[request.status] ?? 'bg-gray-100 text-gray-600'
  const statusLabel = STATUS_LABELS[request.status] ?? request.status
  const letterLabel = LETTER_TYPE_LABELS[request.letter_type] ?? request.letter_type

  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/letter-requests" className="hover:text-gray-700">
          Permintaan Surat
        </Link>
        <span>/</span>
        <span className="text-gray-900">Detail</span>
      </nav>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{letterLabel}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Dibuat: {formatDateTime(request.created_at)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadge}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data yang dikumpulkan */}
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-900">Data Pemohon</h2>
          {formDataEntries.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada data yang dikumpulkan.</p>
          ) : (
            <dl className="space-y-3">
              {formDataEntries.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs text-gray-400">
                    {FIELD_LABELS[key] ?? key.replace(/_/g, ' ')}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Draft surat */}
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-900">Draft Surat</h2>
          {request.draft_text ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-800">
              {request.draft_text}
            </pre>
          ) : (
            <p className="text-sm text-gray-400">
              Draft belum dibuat — data pemohon belum lengkap.
            </p>
          )}
        </div>
      </div>

      {/* Aksi admin */}
      {request.status === 'waiting_admin_review' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Setujui */}
          <div className="card">
            <h3 className="mb-3 font-semibold text-gray-900">Setujui Surat</h3>
            <p className="mb-4 text-sm text-gray-500">
              Draft surat akan ditandai sebagai disetujui. Warga bisa mengambil surat
              ke pengurus RT.
            </p>
            <form action={approveWithId}>
              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                ✓ Setujui Surat
              </button>
            </form>
          </div>

          {/* Tolak */}
          <div className="card">
            <h3 className="mb-3 font-semibold text-gray-900">Tolak Surat</h3>
            <form action={rejectWithId} className="space-y-3">
              <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
                  Catatan penolakan (opsional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Contoh: Data NIK tidak sesuai, silakan perbaiki."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ✕ Tolak Surat
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Catatan admin jika sudah diproses */}
      {request.status !== 'waiting_admin_review' && request.status !== 'collecting_data' && (
        <div className="mt-6 card">
          <h3 className="mb-2 font-semibold text-gray-900">Catatan Admin</h3>
          <p className="text-sm text-gray-600">
            {request.admin_notes ?? 'Tidak ada catatan.'}
          </p>
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin/letter-requests" className="text-sm text-gray-400 hover:text-gray-600">
          ← Kembali ke daftar surat
        </Link>
      </div>
    </div>
  )
}
