import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-6 text-6xl font-bold text-gray-200">404</div>
      <h1 className="mb-3 text-2xl font-bold text-gray-900">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mb-8 max-w-sm text-gray-500">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        &larr; Kembali ke Beranda
      </Link>
    </div>
  )
}
