'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'

interface StoreClientProps {
  products: Product[]
}

const nairaFmt = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
})
const formatNaira = (kobo: number) => nairaFmt.format(kobo / 100)

export default function StoreClient({ products }: StoreClientProps) {
  const [selected, setSelected] = useState<Product | null>(null)

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOrder={() => setSelected(product)}
          />
        ))}
      </div>

      {selected && (
        <OrderModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

function ProductCard({
  product,
  onOrder,
}: {
  product: Product
  onOrder: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="bg-white rounded-[20px] border border-[#E8E8EF] overflow-hidden group hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(31,18,72,0.28)] transition-all duration-300">
      {/* Image */}
      <div
        className="relative aspect-3/2 bg-[#F1F0F6] cursor-pointer overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={product.front_image_url}
          alt={`${product.name} — Front`}
          fill
          className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        />
        <Image
          src={product.back_image_url}
          alt={`${product.name} — Back`}
          fill
          className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Side indicator */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#0F1115]/55 rounded-lg backdrop-blur-sm">
          <span className="font-satoshi text-[10px] font-bold text-white/85 uppercase tracking-widest">
            {isHovered ? 'Back' : 'Front'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="font-satoshi font-bold text-[#15131C] mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[#6B6478] text-sm leading-relaxed font-medium mb-4">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="font-satoshi font-black text-2xl text-[#15131C] tracking-[-0.02em]">
            {formatNaira(product.price)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#9098A3]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
              <path d="M5 9a9 9 0 0114 0M8 12a5 5 0 018 0M11 15a1.5 1.5 0 012 0" />
            </svg>
            Tap to flip
          </span>
        </div>
        <button
          onClick={onOrder}
          className="w-full bg-brand-gradient text-white rounded-xl py-3 font-satoshi font-bold text-sm shadow-[0_10px_24px_-8px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform"
        >
          Order this card
        </button>
      </div>
    </div>
  )
}

interface OrderForm {
  fullName: string
  email: string
  phone: string
  state: string
  city: string
  address: string
  quantity: number
  nameOnCard: string
  professionOnCard: string
  notes: string
  company: string // honeypot
}

const EMPTY_FORM: OrderForm = {
  fullName: '',
  email: '',
  phone: '',
  state: '',
  city: '',
  address: '',
  quantity: 1,
  nameOnCard: '',
  professionOnCard: '',
  notes: '',
  company: '',
}

function OrderModal({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [error, setError] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  const update =
    (key: keyof OrderForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const qty = Number(form.quantity) || 1
  const lineTotal = product.price * qty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const res = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, ...form, quantity: qty }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setOrderNumber(data.orderNumber || '')
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('idle')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1115]/60 backdrop-blur-sm"
      onClick={status === 'submitting' ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[24px] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 inline-flex items-center justify-center rounded-full bg-[#F1F0F6] text-[#6B6478] hover:bg-[#E8E8EF] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-4 h-4">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-brand-gradient flex items-center justify-center mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-satoshi font-black text-[#15131C] text-2xl tracking-[-0.02em] mb-2">
              Order received
            </h3>
            <p className="text-[#6B6478] font-medium leading-relaxed mb-4">
              Thanks, {form.fullName.split(' ')[0] || 'there'}. We&apos;ll reach
              out by phone or WhatsApp to confirm your card details, delivery,
              and payment.
            </p>
            {orderNumber && (
              <p className="text-sm font-semibold text-[#15131C] mb-6">
                Your reference:{' '}
                <span className="font-satoshi text-[#5A2DD4]">{orderNumber}</span>
              </p>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-7 py-3 bg-[#15131C] text-white rounded-xl font-satoshi font-bold text-sm hover:-translate-y-0.5 transition-transform"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Product summary */}
            <div className="flex items-center gap-4 mb-6 pr-8">
              <div className="relative w-16 h-11 shrink-0 rounded-lg overflow-hidden bg-[#F1F0F6]">
                <Image
                  src={product.front_image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-satoshi text-[11px] font-bold tracking-[0.12em] uppercase text-[#9098A3]">
                  Ordering
                </p>
                <h3 className="font-satoshi font-bold text-[#15131C] leading-tight">
                  {product.name}
                </h3>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Field label="Full name">
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={update('fullName')}
                  className={inputClass}
                  placeholder="Jane Doe"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    className={inputClass}
                    placeholder="jane@email.com"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={update('phone')}
                    className={inputClass}
                    placeholder="080 1234 5678"
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="State">
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={update('state')}
                    className={inputClass}
                    placeholder="Lagos"
                  />
                </Field>
                <Field label="City">
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={update('city')}
                    className={inputClass}
                    placeholder="Ikeja"
                  />
                </Field>
              </div>

              <Field label="Delivery address">
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={update('address')}
                  className={inputClass}
                  placeholder="12 Allen Avenue, Apt 4"
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Quantity">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={form.quantity}
                    onChange={update('quantity')}
                    className={inputClass}
                  />
                </Field>
                <Field label="Name on card" hint="Defaults to your name">
                  <input
                    type="text"
                    value={form.nameOnCard}
                    onChange={update('nameOnCard')}
                    className={inputClass}
                    placeholder={form.fullName || 'Jane Doe'}
                  />
                </Field>
              </div>

              <Field label="Title on card" hint="Optional">
                <input
                  type="text"
                  value={form.professionOnCard}
                  onChange={update('professionOnCard')}
                  className={inputClass}
                  placeholder="Product Designer"
                />
              </Field>

              <Field label="Notes" hint="Optional">
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={update('notes')}
                  className={`${inputClass} resize-none`}
                  placeholder="Anything we should know?"
                />
              </Field>

              {/* Honeypot — hidden from real users */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.company}
                onChange={update('company')}
                className="absolute left-[-9999px] w-px h-px opacity-0"
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#E8E8EF]">
              <div>
                <span className="font-satoshi font-black text-2xl text-[#15131C] tracking-[-0.02em]">
                  {formatNaira(lineTotal)}
                </span>
                <span className="text-[12px] font-medium text-[#9098A3] ml-2">
                  + delivery
                </span>
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-8px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {status === 'submitting' ? 'Placing…' : 'Place order'}
              </button>
            </div>
            <p className="text-[12px] text-[#9098A3] font-medium mt-3 leading-relaxed">
              No payment now — we&apos;ll confirm the details and delivery with
              you first.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[#E8E8EF] bg-[#FAFAFC] text-[#15131C] font-medium text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-colors placeholder:text-[#B5B2BE]'

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="font-satoshi text-[13px] font-bold text-[#15131C]">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] font-medium text-[#9098A3]">{hint}</span>
        )}
      </span>
      {children}
    </label>
  )
}
