import { checkWriterAuth } from '@/lib/writerAuth'
import StudioHeader from '@/components/studio/StudioHeader'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await checkWriterAuth()

  return (
    <div className="flex min-h-screen flex-col bg-grey6 dark:bg-surface">
      <StudioHeader userName={user.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>
    </div>
  )
}
