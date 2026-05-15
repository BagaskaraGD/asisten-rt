import Link from 'next/link'
import { logout } from '@/app/actions/auth'

interface HeaderProps {
  variant?: 'landing' | 'admin' | 'warga'
  userName?: string
}

export default function Header({ variant = 'landing', userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">RT</span>
          </div>
          <span className="text-lg font-bold text-gray-900">AsistenRT</span>
        </Link>

        <nav className="flex items-center gap-3">
          {variant === 'landing' && (
            <>
              <Link
                href="/chat"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Chat Warga
              </Link>
              <Link
                href="/admin"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Masuk Admin
              </Link>
            </>
          )}

          {variant === 'admin' && (
            <>
              <span className="hidden rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 sm:inline">
                Panel Admin
              </span>
              {userName && (
                <span className="hidden max-w-[160px] truncate text-sm text-gray-500 lg:block">
                  {userName}
                </span>
              )}
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
            </>
          )}

          {variant === 'warga' && (
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Kembali ke Beranda
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
