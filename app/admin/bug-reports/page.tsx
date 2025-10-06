import { createAdminClient } from '@/lib/adminAuth'
import { BugReport } from '@/lib/types'

export default async function BugReportsPage() {
  const supabase = createAdminClient()

  const { data: bugReports } = await supabase
    .from('bug_reports')
    .select('*')
    .order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-errorRed/10 text-errorRed',
      in_progress: 'bg-warningYellow/10 text-warningYellow',
      resolved: 'bg-successGreen/10 text-successGreen',
      closed: 'bg-grey3/10 text-grey3',
    }
    return styles[status as keyof typeof styles] || styles.open
  }

  return (
    <div>
      <h1 className="font-satoshi font-black text-4xl mb-8">Bug Reports</h1>

      {!bugReports || bugReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <p className="font-spaceGrotesk text-xl text-grey2">No bug reports yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bugReports.map((bug: BugReport) => (
            <div key={bug.id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-spaceGrotesk font-bold text-xl">{bug.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-spaceGrotesk font-semibold ${getStatusBadge(
                        bug.status
                      )}`}
                    >
                      {bug.status?.toUpperCase() || 'OPEN'}
                    </span>
                  </div>
                  <p className="text-sm text-grey2 font-openSans">
                    Reported: {new Date(bug.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="font-openSans text-grey1 mb-4 whitespace-pre-wrap">{bug.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}