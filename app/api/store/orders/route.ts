import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service-role client: bypasses RLS, so every value below is validated or
// derived server-side. The client is never trusted for price.
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Matches the existing app-generated format, e.g. ORD-20251110-B0FD3A
function generateOrderNumber() {
  const d = new Date()
  const ymd =
    `${d.getUTCFullYear()}` +
    `${String(d.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(d.getUTCDate()).padStart(2, '0')}`
  return `ORD-${ymd}-${randomBytes(3).toString('hex').toUpperCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productId,
      quantity,
      fullName,
      email,
      phone,
      state,
      city,
      address,
      nameOnCard,
      professionOnCard,
      notes,
      company, // honeypot — must stay empty
    } = body ?? {}

    // Bots fill hidden fields. Pretend success and drop it.
    if (company) {
      return NextResponse.json({ success: true })
    }

    // ---- Validation -------------------------------------------------
    const qty = Number.parseInt(quantity, 10)
    const missing: string[] = []
    if (!productId || typeof productId !== 'string') missing.push('a card')
    if (!fullName?.trim()) missing.push('your name')
    if (!email?.trim() || !EMAIL_RE.test(email.trim())) missing.push('a valid email')
    if (!phone?.trim()) missing.push('a phone number')
    if (!state?.trim()) missing.push('a state')
    if (!city?.trim()) missing.push('a city')
    if (!address?.trim()) missing.push('a delivery address')
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) missing.push('a quantity (1–10)')

    if (missing.length) {
      return NextResponse.json(
        { error: `Please provide ${missing.join(', ')}.` },
        { status: 400 }
      )
    }

    // ---- Authoritative product + price (never trust the client) -----
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, slug, price, front_image_url')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'That card is no longer available.' },
        { status: 404 }
      )
    }

    const unitPrice = product.price // kobo
    const lineTotal = unitPrice * qty
    const shippingCost = 0 // settled when admin makes contact
    const totalAmount = lineTotal + shippingCost

    const cleanName = fullName.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()

    const deliveryAddress = {
      name: cleanName,
      phone: cleanPhone,
      state: state.trim(),
      city: city.trim(),
      address: address.trim(),
      country: 'Nigeria',
      postal_code: '',
    }

    const statusHistory = [
      {
        status: 'pending_contact',
        timestamp: new Date().toISOString(),
        note: 'Order placed via web store',
        changedBy: null,
      },
    ]

    // ---- Insert order (retry the rare order_number collision) -------
    let order: { id: string; order_number: string } | null = null
    let lastError: { code?: string; message?: string } | null = null
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: null,
          guest_name: cleanName,
          guest_email: cleanEmail,
          guest_phone: cleanPhone,
          order_number: generateOrderNumber(),
          status: 'pending_contact',
          subtotal: lineTotal,
          shipping_cost: shippingCost,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
          customer_notes: notes?.trim() || null,
          status_history: statusHistory,
        })
        .select('id, order_number')
        .single()

      if (!error) {
        order = data
        break
      }
      lastError = error
      if (error.code !== '23505') break // not a uniqueness clash → real failure
    }

    if (!order) {
      console.error('Store order insert failed:', lastError)
      throw new Error('Could not create your order. Please try again.')
    }

    // ---- Insert the order item --------------------------------------
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      thumbnail_url: product.front_image_url,
      card_type: product.slug,
      card_design: {
        name_on_card: nameOnCard?.trim() || cleanName,
        profession_on_card: professionOnCard?.trim() || '',
      },
      unit_price: unitPrice,
      quantity: qty,
      total_price: lineTotal,
    })

    if (itemError) {
      // Don't leave an empty order in the pipeline.
      await supabase.from('orders').delete().eq('id', order.id)
      console.error('Store order item insert failed:', itemError)
      throw new Error('Could not create your order. Please try again.')
    }

    return NextResponse.json({ success: true, orderNumber: order.order_number })
  } catch (error) {
    console.error('Store order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
