import { createAdminClient } from '@/lib/adminAuth'
import { Order } from '@/lib/types'

export default async function OrdersPage() {
  const supabase = createAdminClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, users(name, email), products(name, price), addresses(*)')
    .order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-warningYellow/10 text-warningYellow',
      processing: 'bg-blue/10 text-blue',
      shipped: 'bg-mainPurple/10 text-mainPurple',
      delivered: 'bg-successGreen/10 text-successGreen',
      cancelled: 'bg-errorRed/10 text-errorRed',
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  return (
    <div>
      <h1 className="font-satoshi font-black text-4xl mb-8">Physical Card Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <p className="font-spaceGrotesk text-xl text-grey2">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-spaceGrotesk font-bold text-xl">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-spaceGrotesk font-semibold ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-grey2 font-openSans">
                    <p>Customer: {order.users?.name || 'N/A'} ({order.users?.email})</p>
                    <p>Product: {order.products?.name || 'N/A'}</p>
                    <p>Quantity: {order.quantity}</p>
                    <p>Total: ₦{((order.products?.price || 0) * order.quantity).toLocaleString()}</p>
                    <p>Ordered: {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {order.addresses && (
                <div className="bg-grey6 rounded-xl p-4">
                  <p className="font-spaceGrotesk font-semibold text-sm mb-2">Shipping Address:</p>
                  <p className="font-openSans text-sm text-grey1">
                    {order.addresses.full_name}<br />
                    {order.addresses.address_line1}<br />
                    {order.addresses.address_line2 && <>{order.addresses.address_line2}<br /></>}
                    {order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}<br />
                    {order.addresses.country}<br />
                    Phone: {order.addresses.phone}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}