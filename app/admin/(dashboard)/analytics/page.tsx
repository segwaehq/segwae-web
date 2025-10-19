import { createAdminClient } from '@/lib/adminAuth'
import { AnalyticsEvent } from '@/lib/types'

export default async function AnalyticsPage() {
  const supabase = createAdminClient()

  // Fetch analytics data
  const [
    { count: totalProfileViews },
    { count: totalQRScans },
    { count: totalLinkClicks },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from('connection_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'profile_view'),
    supabase.from('connection_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'qr_scan'),
    supabase.from('connection_analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'link_click'),
    supabase.from('connection_analytics').select('*, users(name, username)').order('created_at', { ascending: false }).limit(20),
  ])

  return (
    <div>
      <h1 className="font-satoshi font-black text-4xl mb-8">Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">
            Total Profile Views
          </h3>
          <p className="font-satoshi font-black text-4xl text-mainPurple">
            {totalProfileViews || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">
            Total QR Scans
          </h3>
          <p className="font-satoshi font-black text-4xl text-blue">{totalQRScans || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">
            Total Link Clicks
          </h3>
          <p className="font-satoshi font-black text-4xl text-successGreen">
            {totalLinkClicks || 0}
          </p>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-spaceGrotesk font-bold text-2xl mb-6">Recent Activity</h2>
        {!recentEvents || recentEvents.length === 0 ? (
          <p className="text-grey3 font-openSans">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((event: AnalyticsEvent) => (
              <div key={event.id} className="flex justify-between items-center border-b border-grey4 pb-3 last:border-0">
                <div>
                  <p className="font-spaceGrotesk font-semibold">
                    {event.event_type.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="text-sm text-grey2 font-openSans">
                    User: {event.users?.name || 'N/A'} (@{event.users?.username})
                  </p>
                </div>
                <span className="text-xs text-grey3 font-openSans">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}