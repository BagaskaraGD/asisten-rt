import { redirect } from 'next/navigation'
import { getCurrentUserWithRole } from '@/lib/auth'
import AdminTopbar from '@/components/admin/AdminTopbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUserWithRole()

  if (!currentUser) {
    redirect('/login')
  }

  if (currentUser.role === 'warga') {
    redirect('/unauthorized')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar email={currentUser.user.email} role={currentUser.role} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
