import { NextResponse } from 'next/server'
import { createAdminClient, checkAdminAuth } from '@/lib/adminAuth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdminAuth()
    const { id } = await params

    const supabase = createAdminClient()
    const body = await request.json()
    const { delivery_address } = body

    if (!delivery_address) {
      return NextResponse.json(
        { error: 'Delivery address is required' },
        { status: 400 }
      )
    }

    // Call the database function to update delivery address
    const { data, error } = await supabase.rpc('update_order_address', {
      p_order_id: id,
      p_delivery_address: delivery_address,
    })

    if (error) {
      console.error('Error updating order address:', error)
      throw error
    }

    if (!data || data.success !== true) {
      throw new Error('Failed to update order address')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in address update API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update address' },
      { status: 500 }
    )
  }
}
