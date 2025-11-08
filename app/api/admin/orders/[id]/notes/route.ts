import { NextResponse } from 'next/server'
import { createAdminClient, checkAdminAuth } from '@/lib/adminAuth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdminAuth()

    const supabase = createAdminClient()
    const body = await request.json()
    const { admin_notes } = body

    // Call the database function to update admin notes
    const { data, error } = await supabase.rpc('update_order_admin_notes', {
      p_order_id: params.id,
      p_admin_notes: admin_notes,
    })

    if (error) {
      console.error('Error updating order notes:', error)
      throw error
    }

    if (!data || data.success !== true) {
      throw new Error('Failed to update order notes')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in notes update API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update notes' },
      { status: 500 }
    )
  }
}
