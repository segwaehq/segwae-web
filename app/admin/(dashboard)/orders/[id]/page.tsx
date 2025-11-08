import { createAdminClient } from '@/lib/adminAuth'
import { notFound } from 'next/navigation'
import OrderEditForm from '@/components/admin/OrderEditForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createAdminClient()

  // Fetch order with all details
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      users(id, name, email, phone, username, custom_username)
    `)
    .eq('id', params.id)
    .single()

  if (error || !order) {
    notFound()
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-satoshi font-black text-4xl mb-2">
          Order {order.order_number}
        </h1>
        <p className="font-spaceGrotesk text-grey2">
          View and edit order details, update status, and track order history.
        </p>
      </div>

      <OrderEditForm order={order} />
    </div>
  )
}
