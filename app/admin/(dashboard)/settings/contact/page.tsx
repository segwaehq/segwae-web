import { createAdminClient } from '@/lib/adminAuth'
import ContactSettingsForm from '@/components/admin/ContactSettingsForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ContactSettingsPage() {
  const supabase = createAdminClient()

  // Fetch current contact settings
  const { data: settings } = await supabase
    .from('contact_settings')
    .select('*')
    .single()

  return (
    <div className="max-w-4xl">
      <h1 className="font-satoshi font-black text-4xl mb-4">Contact Settings</h1>
      <p className="font-spaceGrotesk text-grey2 mb-8">
        Configure WhatsApp and Instagram contact information for order placement.
      </p>

      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <ContactSettingsForm initialSettings={settings} />
      </div>

      <div className="mt-8 bg-blue/5 border border-blue/20 rounded-xl p-6">
        <h2 className="font-spaceGrotesk font-bold text-lg mb-3 text-blue">ℹ️ Important</h2>
        <div className="space-y-2 font-openSans text-sm text-grey1">
          <p>
            <strong>WhatsApp Number Format:</strong> Enter the number with country code, no spaces or special characters.
          </p>
          <p className="font-mono bg-white px-3 py-2 rounded">
            Example: 2348012345678 (not +234 801 234 5678)
          </p>
          <p className="mt-4">
            <strong>Instagram Handle:</strong> Enter the username only, without the @ symbol.
          </p>
          <p className="font-mono bg-white px-3 py-2 rounded">
            Example: segwaehq (not @segwaehq)
          </p>
        </div>
      </div>
    </div>
  )
}
