import { NextResponse } from 'next/server'
import { createAdminClient, checkAdminAuth } from '@/lib/adminAuth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const admin = await checkAdminAuth()
    const { itemId } = await params

    const supabase = createAdminClient()
    const body = await request.json()
    const { quantity, unit_price } = body

    if (!quantity || !unit_price) {
      return NextResponse.json(
        { error: 'Quantity and unit price are required' },
        { status: 400 }
      )
    }

    // Call the database function to update order item
    const { data, error } = await supabase.rpc('update_order_item', {
      p_order_item_id: itemId,
      p_quantity: quantity,
      p_unit_price: unit_price,
      p_changed_by: admin.id,
    })

    if (error) {
      console.error('Error updating order item:', error)
      throw error
    }

    if (!data || data.success !== true) {
      throw new Error('Failed to update order item')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in item update API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update item' },
      { status: 500 }
    )
  }
}
