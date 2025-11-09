import { NextResponse } from 'next/server'
import { createAdminClient, checkAdminAuth } from '@/lib/adminAuth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const admin = await checkAdminAuth()
    const { id } = await params

    const supabase = createAdminClient()
    const body = await request.json()
    const { status, note } = body

    if (!status || !note) {
      return NextResponse.json(
        { error: 'Status and note are required' },
        { status: 400 }
      )
    }

    // Call the database function to update order status with history
    const { data, error } = await supabase.rpc('update_order_status_with_history', {
      p_order_id: id,
      p_status: status,
      p_changed_by: admin.id,
      p_note: note,
    })

    if (error) {
      console.error('Error updating order status:', error)
      throw error
    }

    if (!data || data.success !== true) {
      throw new Error('Failed to update order status')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in status update API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update status' },
      { status: 500 }
    )
  }
}
