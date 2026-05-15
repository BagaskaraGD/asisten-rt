import type { Metadata } from 'next'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export const metadata: Metadata = {
  title: 'Akses Ditolak',
}

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <span className="text-3xl">🚫</span>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">Akses Ditolak</h1>
      <p className="mb-2 max-w-sm text-gray-500">
        Akun Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <p className="mb-8 text-sm text-gray-400">
        Halaman ini hanya bisa diakses oleh admin RT atau super admin.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/chat"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Pergi ke Chat Warga
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  )
}
