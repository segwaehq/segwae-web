import { createAdminClient } from '@/lib/adminAuth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import OrderEditForm from '@/components/admin/OrderEditForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  // Fetch order with order_items
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Fetch user data separately. Web/guest orders have no user_id —
  // their contact details live on the order (guest_* + delivery_address).
  let userData = null
  if (order.user_id) {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, phone, username, custom_username')
      .eq('id', order.user_id)
      .single()
    userData = data
  }

  // Merge user data into order
  const orderWithUser = {
    ...order,
    users: userData
  }

  return (
    <div className="max-w-6xl">
      {/* Back Button */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-grey2 dark:text-content-muted hover:text-mainPurple dark:hover:text-[#b9a4f7] font-spaceGrotesk font-semibold mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </Link>

      <div className="mb-6">
        <h1 className="font-satoshi font-black text-4xl mb-2">
          Order {orderWithUser.order_number}
        </h1>
        <p className="font-spaceGrotesk text-grey2 dark:text-content-muted">
          View and edit order details, update status, and track order history.
        </p>
      </div>

      <OrderEditForm order={orderWithUser} />
    </div>
  )
}
