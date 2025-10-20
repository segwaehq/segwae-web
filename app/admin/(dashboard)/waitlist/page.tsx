import { createClient } from '@supabase/supabase-js'
import WaitlistClient from './WaitlistClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function WaitlistPage() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch all waitlist subscribers
  const { data: subscribers, error } = await supabase
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching waitlist:', error)
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <p className="font-spaceGrotesk text-xl text-errorRed">Failed to load waitlist</p>
      </div>
    )
  }

  return <WaitlistClient initialSubscribers={subscribers || []} />
}
