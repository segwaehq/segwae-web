'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CardDesign {
  nameOnCard: string
  professionOnCard: string
  [key: string]: unknown // Allow additional properties
}

interface DeliveryAddress {
  state: string
  city: string
  address: string
}

interface StatusHistoryEntry {
  status: string
  timestamp: string
  note?: string
  changedByName?: string
}

interface OrderItem {
  id: string
  card_type: string
  card_design: CardDesign
  unit_price: number
  quantity: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  user_id: string
  status: string
  subtotal: number
  shipping_cost: number
  total_amount: number
  delivery_address: DeliveryAddress
  customer_notes?: string
  admin_notes?: string
  status_history?: StatusHistoryEntry[]
  created_at: string
  updated_at: string
  order_items: OrderItem[]
  users: {
    id: string
    name: string
    email: string
    phone?: string
    username?: string
    custom_username?: string
  }
}

interface Props {
  order: Order
}

const ORDER_STATUSES = [
  { value: 'pending_contact', label: 'Pending Contact', color: 'bg-warningYellow/10 text-warningYellow' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue/10 text-blue' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue/10 text-blue' },
  { value: 'pending_payment', label: 'Pending Payment', color: 'bg-warningYellow/10 text-warningYellow' },
  { value: 'paid', label: 'Paid', color: 'bg-successGreen/10 text-successGreen' },
  { value: 'processing', label: 'Processing', color: 'bg-mainPurple/10 text-mainPurple' },
  { value: 'shipped', label: 'Shipped', color: 'bg-mainPurple/10 text-mainPurple' },
  { value: 'delivered', label: 'Delivered', color: 'bg-successGreen/10 text-successGreen' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-errorRed/10 text-errorRed' },
]

export default function OrderEditForm({ order }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [status, setStatus] = useState(order.status)
  const [statusNote, setStatusNote] = useState('')
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '')
  const [deliveryAddress, setDeliveryAddress] = useState(order.delivery_address)

  // Order items editing
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [itemQuantity, setItemQuantity] = useState<number>(0)
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0)

  const profileLink = `https://segwae.com/${order.users.custom_username || order.users.username}`

  const handleStatusUpdate = async () => {
    if (!statusNote.trim()) {
      setError('Please add a note for the status change')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note: statusNote,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }

      setSuccess('Status updated successfully!')
      setStatusNote('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleNotesUpdate = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update notes')
      }

      setSuccess('Notes updated successfully!')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressUpdate = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_address: deliveryAddress }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update address')
      }

      setSuccess('Address updated successfully!')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleItemUpdate = async (itemId: string) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/items/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: itemQuantity,
          unit_price: itemUnitPrice,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update item')
      }

      setSuccess('Order item updated successfully!')
      setEditingItemId(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-NG')

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-errorRed/10 border border-errorRed/20 rounded-xl p-4">
          <p className="font-spaceGrotesk text-errorRed text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-successGreen/10 border border-successGreen/20 rounded-xl p-4">
          <p className="font-spaceGrotesk text-successGreen text-sm">✓ {success}</p>
        </div>
      )}

      {/* Customer Information (Read-only) */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-spaceGrotesk font-bold text-xl mb-4">Customer Information</h2>
        <div className="grid md:grid-cols-2 gap-4 font-openSans text-sm">
          <div>
            <p className="text-grey3 mb-1">Name</p>
            <p className="font-semibold">{order.users.name}</p>
          </div>
          <div>
            <p className="text-grey3 mb-1">Email</p>
            <p className="font-semibold">{order.users.email}</p>
          </div>
          {order.users.phone && (
            <div>
              <p className="text-grey3 mb-1">Phone</p>
              <p className="font-semibold">{order.users.phone}</p>
            </div>
          )}
          <div>
            <p className="text-grey3 mb-1">Profile</p>
            <a
              href={profileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-mainPurple hover:underline"
            >
              {profileLink}
            </a>
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-spaceGrotesk font-bold text-xl mb-4">Order Status</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-spaceGrotesk font-semibold text-sm mb-2">
              Current Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-grey4 font-spaceGrotesk focus:outline-none focus:ring-2 focus:ring-mainPurple"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-spaceGrotesk font-semibold text-sm mb-2">
              Status Change Note
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add a note about this status change (e.g., 'Customer confirmed via WhatsApp')"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-grey4 font-openSans focus:outline-none focus:ring-2 focus:ring-mainPurple"
            />
          </div>

          <button
            onClick={handleStatusUpdate}
            disabled={loading || status === order.status || !statusNote.trim()}
            className="w-full bg-mainPurple text-white font-spaceGrotesk font-semibold py-3 px-6 rounded-xl hover:bg-mainPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Status History */}
      {order.status_history && order.status_history.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-spaceGrotesk font-bold text-xl mb-4">Status History</h2>
          <div className="space-y-3">
            {order.status_history.map((entry: StatusHistoryEntry, index: number) => {
              const statusInfo = ORDER_STATUSES.find((s) => s.value === entry.status)
              return (
                <div key={index} className="border-l-4 border-mainPurple pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo?.color}`}>
                      {statusInfo?.label || entry.status}
                    </span>
                    <span className="text-xs text-grey3">{formatDate(entry.timestamp)}</span>
                  </div>
                  {entry.note && <p className="text-sm text-grey2 font-openSans">{entry.note}</p>}
                  {entry.changedByName && (
                    <p className="text-xs text-grey3 mt-1">by {entry.changedByName}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-spaceGrotesk font-bold text-xl mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.order_items.map((item) => {
            const isEditing = editingItemId === item.id
            return (
              <div key={item.id} className="border border-grey4 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-spaceGrotesk font-semibold">{item.card_type}</p>
                    <p className="text-sm text-grey2">
                      {item.card_design?.nameOnCard} • {item.card_design?.professionOnCard}
                    </p>
                  </div>
                  {!isEditing && ['pending_contact', 'contacted', 'confirmed', 'pending_payment'].includes(order.status) && (
                    <button
                      onClick={() => {
                        setEditingItemId(item.id)
                        setItemQuantity(item.quantity)
                        setItemUnitPrice(item.unit_price)
                      }}
                      className="text-mainPurple text-sm font-spaceGrotesk font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-grey3 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(parseInt(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 rounded-lg border border-grey4 focus:outline-none focus:ring-2 focus:ring-mainPurple"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-grey3 mb-1">Unit Price (₦)</label>
                        <input
                          type="number"
                          value={itemUnitPrice / 100}
                          onChange={(e) => setItemUnitPrice(parseFloat(e.target.value) * 100)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 rounded-lg border border-grey4 focus:outline-none focus:ring-2 focus:ring-mainPurple"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-grey2">
                      New Total: {formatPrice(itemQuantity * itemUnitPrice)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleItemUpdate(item.id)}
                        disabled={loading}
                        className="flex-1 bg-mainPurple text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-mainPurple/90 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-grey2 hover:bg-grey6"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-grey2 space-y-1">
                    <p>Quantity: {item.quantity}</p>
                    <p>Unit Price: {formatPrice(item.unit_price)}</p>
                    <p className="font-semibold text-grey1">Total: {formatPrice(item.total_price)}</p>
                  </div>
                )}
              </div>
            )
          })}

          <div className="border-t border-grey4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-grey2">Subtotal:</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-grey2">Shipping:</span>
              <span className="font-semibold">{formatPrice(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-spaceGrotesk font-bold text-xl mb-4">Delivery Address</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-spaceGrotesk font-semibold text-sm mb-2">State</label>
              <input
                type="text"
                value={deliveryAddress.state || ''}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-grey4 focus:outline-none focus:ring-2 focus:ring-mainPurple"
              />
            </div>
            <div>
              <label className="block font-spaceGrotesk font-semibold text-sm mb-2">City</label>
              <input
                type="text"
                value={deliveryAddress.city || ''}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-grey4 focus:outline-none focus:ring-2 focus:ring-mainPurple"
              />
            </div>
          </div>
          <div>
            <label className="block font-spaceGrotesk font-semibold text-sm mb-2">Street Address</label>
            <input
              type="text"
              value={deliveryAddress.address || ''}
              onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-grey4 focus:outline-none focus:ring-2 focus:ring-mainPurple"
            />
          </div>
          <button
            onClick={handleAddressUpdate}
            disabled={loading}
            className="w-full bg-mainPurple text-white font-spaceGrotesk font-semibold py-3 px-6 rounded-xl hover:bg-mainPurple/90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Updating...' : 'Update Address'}
          </button>
        </div>
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-spaceGrotesk font-bold text-xl mb-4">Admin Notes</h2>
        <div className="space-y-4">
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes for tracking..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-grey4 font-openSans focus:outline-none focus:ring-2 focus:ring-mainPurple"
          />
          <button
            onClick={handleNotesUpdate}
            disabled={loading}
            className="w-full bg-mainPurple text-white font-spaceGrotesk font-semibold py-3 px-6 rounded-xl hover:bg-mainPurple/90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      {/* Order Metadata */}
      <div className="bg-grey6 rounded-2xl p-6">
        <h3 className="font-spaceGrotesk font-bold mb-3">Order Details</h3>
        <div className="space-y-2 text-sm font-openSans text-grey2">
          <p><strong>Created:</strong> {formatDate(order.created_at)}</p>
          <p><strong>Last Updated:</strong> {formatDate(order.updated_at)}</p>
          <p><strong>Order ID:</strong> {order.id}</p>
        </div>
      </div>
    </div>
  )
}
