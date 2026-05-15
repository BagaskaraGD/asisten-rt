import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import type { UserRole } from '@/types'

interface AdminTopbarProps {
  email: string
  role: UserRole
}

const roleLabel: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  rt_admin: 'Admin RT',
  warga: 'Warga',
}

const roleBadgeClass: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  rt_admin: 'bg-blue-100 text-blue-800',
  warga: 'bg-gray-100 text-gray-700',
}

export default function AdminTopbar({ email, role }: AdminTopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <Link href="/admin" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-xs font-bold text-white">RT</span>
        </div>
        <span className="font-semibold text-gray-900">AsistenRT</span>
        <span className="hidden text-gray-300 sm:inline">/</span>
        <span className="hidden text-sm text-gray-500 sm:inline">Admin</span>
      </Link>

      <div className="flex items-center gap-3">
        <span
          className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline ${roleBadgeClass[role]}`}
        >
          {roleLabel[role]}
        </span>
        <span className="hidden max-w-[200px] truncate text-sm text-gray-500 md:block">
          {email}
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  )
}
