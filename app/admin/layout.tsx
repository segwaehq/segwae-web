import { checkAdminAuth } from '@/lib/adminAuth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

// Force dynamic rendering for all admin routes
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await checkAdminAuth()

  return (
    <div className="min-h-screen bg-grey6">
      <AdminSidebar />
      <div className="lg:ml-64">
        <AdminHeader user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}