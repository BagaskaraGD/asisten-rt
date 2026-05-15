'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', icon: '🏠', href: '/admin', exact: true },
  { label: 'Profil RT', icon: '🏘️', href: '/admin/profile', exact: false },
  { label: 'FAQ', icon: '❓', href: '/admin/faqs', exact: false },
  { label: 'Template Surat', icon: '📋', href: '/admin/letter-templates', exact: false },
  { label: 'Permintaan Surat', icon: '📄', href: '/admin/letter-requests', exact: false },
  { label: 'Laporan Keluhan', icon: '📢', href: '/admin/complaints', exact: false },
  { label: 'AI Audit Log', icon: '🔍', href: '/admin/ai-audit-logs', exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Menu
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <p className="text-xs text-gray-400">AsistenRT MVP v1</p>
      </div>
    </aside>
  )
}
