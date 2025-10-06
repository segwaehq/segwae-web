// import { redirect } from 'next/navigation'
// import { createClient } from '@supabase/supabase-js'
// import { cookies } from 'next/headers'
// import Link from 'next/link'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export default async function AdminDashboard() {
//   // Create Supabase client
//   const supabase = createClient(supabaseUrl, supabaseAnonKey)

//   // Check if user is authenticated
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user) {
//     redirect('/admin/login') // You'll need to create this login page
//   }

//   // Get stats
//   const { count: newMessages } = await supabase
//     .from('contact_messages')
//     .select('*', { count: 'exact', head: true })
//     .eq('status', 'new')

//   const { count: totalWaitlist } = await supabase
//     .from('waitlist')
//     .select('*', { count: 'exact', head: true })

//   return (
//     <div className="min-h-screen bg-grey6 py-16 px-4">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="font-satoshi font-black text-5xl mb-8">Admin Dashboard</h1>

//         <div className="grid md:grid-cols-3 gap-6 mb-12">
//           {/* New Messages Card */}
//           <div className="bg-white rounded-2xl p-6 shadow-lg">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-spaceGrotesk font-semibold text-lg">New Messages</h3>
//               <div className="w-12 h-12 bg-mainPurple/10 rounded-full flex items-center justify-center">
//                 <svg className="w-6 h-6 text-mainPurple" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                   <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                 </svg>
//               </div>
//             </div>
//             <p className="font-satoshi font-black text-4xl text-mainPurple">{newMessages || 0}</p>
//             <Link
//               href="/admin/contact-messages"
//               className="mt-4 inline-block text-mainPurple hover:underline font-spaceGrotesk font-semibold"
//             >
//               View Messages →
//             </Link>
//           </div>

//           {/* Waitlist Card */}
//           <div className="bg-white rounded-2xl p-6 shadow-lg">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-spaceGrotesk font-semibold text-lg">Waitlist Subscribers</h3>
//               <div className="w-12 h-12 bg-blue/10 rounded-full flex items-center justify-center">
//                 <svg className="w-6 h-6 text-blue" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
//                 </svg>
//               </div>
//             </div>
//             <p className="font-satoshi font-black text-4xl text-blue">{totalWaitlist || 0}</p>
//           </div>

//           {/* Quick Actions Card */}
//           <div className="bg-white rounded-2xl p-6 shadow-lg">
//             <h3 className="font-spaceGrotesk font-semibold text-lg mb-4">Quick Actions</h3>
//             <div className="space-y-3">
//               <Link
//                 href="/admin/contact-messages"
//                 className="block w-full bg-grey6 hover:bg-mainPurple hover:text-white px-4 py-2 rounded-lg font-spaceGrotesk transition-all text-center"
//               >
//                 Contact Messages
//               </Link>
//               <button className="w-full bg-grey6 hover:bg-mainPurple hover:text-white px-4 py-2 rounded-lg font-spaceGrotesk transition-all">
//                 Export Data
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



















import { createAdminClient } from '@/lib/adminAuth'
import StatsCard from '@/components/admin/StatsCard'
import { ContactMessage } from '@/lib/types'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  // Fetch all stats in parallel
  const [
    { count: newMessages },
    { count: totalMessages },
    { count: totalWaitlist },
    { count: totalUsers },
    { count: totalBugReports },
    { count: totalOrders },
    { data: recentMessages },
  ] = await Promise.all([
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('waitlist').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('bug_reports').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div>
      <h1 className="font-satoshi font-black text-4xl mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard
          title="New Messages"
          value={newMessages || 0}
          color="purple"
          href="/admin/contact-messages"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
        />

        <StatsCard
          title="Total Users"
          value={totalUsers || 0}
          color="blue"
          href="/admin/users"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
        />

        <StatsCard
          title="Waitlist Subscribers"
          value={totalWaitlist || 0}
          color="green"
          href="/admin/waitlist"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          }
        />

        <StatsCard
          title="Total Orders"
          value={totalOrders || 0}
          color="yellow"
          href="/admin/orders"
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          }
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-grey2 font-openSans">Total Messages:</span>
              <span className="font-spaceGrotesk font-semibold">{totalMessages || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-grey2 font-openSans">Bug Reports:</span>
              <span className="font-spaceGrotesk font-semibold">{totalBugReports || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-grey2 font-openSans">Pending Orders:</span>
              <span className="font-spaceGrotesk font-semibold">
                {totalOrders || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold mb-4">Recent Contact Messages</h3>
          {!recentMessages || recentMessages.length === 0 ? (
            <p className="text-grey3 font-openSans">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg: ContactMessage) => (
                <div key={msg.id} className="flex justify-between items-start border-b border-grey4 pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-spaceGrotesk font-semibold">{msg.name}</p>
                    <p className="text-sm text-grey2 font-openSans truncate">{msg.subject}</p>
                  </div>
                  <span className="text-xs text-grey3 font-openSans">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}