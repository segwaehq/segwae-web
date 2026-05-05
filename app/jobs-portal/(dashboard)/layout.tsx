import { checkJobManagerAuth } from '@/lib/jobManagerAuth'
import PortalHeader from '@/components/jobs-portal/PortalHeader'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobsPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await checkJobManagerAuth()

  return (
    <div className="min-h-screen bg-grey6 flex flex-col">
      <PortalHeader userName={user.name} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">
        {children}
      </main>
    </div>
  )
}
