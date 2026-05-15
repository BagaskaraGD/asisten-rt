import type { Metadata } from 'next'
import { getRTProfile } from '@/lib/database/queries'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Profil RT — Admin',
}

export default async function AdminProfilePage() {
  const rt = await getRTProfile()

  if (!rt) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profil RT</h1>
          <p className="mt-1 text-sm text-gray-500">Data identitas dan kontak pengurus RT</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <span className="mb-4 text-5xl">🏘️</span>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Data RT tidak ditemukan</h2>
          <p className="max-w-sm text-sm text-gray-500">
            Pastikan migration dan seed SQL sudah dijalankan di Supabase.
          </p>
        </div>
      </div>
    )
  }

  const infoRows = [
    { label: 'Nama RT', value: rt.name },
    { label: 'RW', value: rt.rw },
    { label: 'Area / Perumahan', value: rt.area_name },
    { label: 'Kelurahan', value: rt.kelurahan },
    { label: 'Kecamatan', value: rt.kecamatan },
    { label: 'Kota', value: rt.city },
    { label: 'Alamat Lengkap', value: rt.address },
  ]

  const contactRows = [
    { label: 'Ketua RT', value: rt.chairman_name },
    { label: 'Sekretaris', value: rt.secretary_name },
    { label: 'Bendahara', value: rt.treasurer_name },
    { label: 'Kontak Keamanan', value: rt.security_contact },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil RT</h1>
          <p className="mt-1 text-sm text-gray-500">Data identitas dan kontak pengurus RT</p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          Read-only
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informasi RT */}
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-900">Informasi RT</h2>
          <dl className="space-y-3">
            {infoRows.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs text-gray-400">{label}</dt>
                <dd className="text-sm font-medium text-gray-800">
                  {value ?? <span className="text-gray-300">Belum diisi</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Kontak Pengurus */}
        <div className="card">
          <h2 className="mb-4 font-semibold text-gray-900">Kontak Pengurus</h2>
          <dl className="space-y-3">
            {contactRows.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs text-gray-400">{label}</dt>
                <dd className="text-sm font-medium text-gray-800">
                  {value ?? <span className="text-gray-300">Belum diisi</span>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">
              Dibuat: {formatDate(rt.created_at)}
            </p>
            <p className="text-xs text-gray-400">
              Diperbarui: {formatDate(rt.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
