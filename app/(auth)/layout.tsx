import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    template: '%s | AsistenRT',
    default: 'AsistenRT',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-base font-bold text-white">RT</span>
          </div>
          <span className="text-xl font-bold text-gray-900">AsistenRT</span>
        </Link>

        {children}
      </div>

      <footer className="py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} AsistenRT
      </footer>
    </div>
  )
}
