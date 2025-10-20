import { createClient } from '@supabase/supabase-js'
import ContactMessagesClient from './ContactMessagesClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function ContactMessagesPage() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch all contact messages
  const { data: messages, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching messages:', error)
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <p className="font-spaceGrotesk text-xl text-errorRed">
          Failed to load contact messages
        </p>
      </div>
    )
  }

  return <ContactMessagesClient initialMessages={messages || []} />
}
