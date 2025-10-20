import { createClient } from '@supabase/supabase-js'
import UsersClient from './UsersClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function UsersPage() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch all users
  const { data: users, error } = await supabase
    .from('users')
    // .select('id, name, email, username, custom_username, subscription_tier, connection_count, created_at')
    .select('id, name, email, username, custom_username, subscription_tier, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <p className="font-spaceGrotesk text-xl text-errorRed">Failed to load users</p>
      </div>
    )
  }

  return <UsersClient initialUsers={users || []} />
}
