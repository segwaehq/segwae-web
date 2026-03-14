'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'

interface StoreClientProps {
  products: Product[]
}

export default function StoreClient({ products }: StoreClientProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(product.price / 100)

  return (
    <div className="bg-white rounded-2xl border border-grey4/60 overflow-hidden group">
      {/* Image */}
      <div
        className="relative aspect-3/2 bg-grey5 cursor-pointer overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={product.front_image_url}
          alt={`${product.name} — Front`}
          fill
          className={`object-cover transition-opacity duration-400 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        />
        <Image
          src={product.back_image_url}
          alt={`${product.name} — Back`}
          fill
          className={`object-cover transition-opacity duration-400 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Side indicator */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 rounded-lg backdrop-blur-sm">
          <span className="font-spaceGrotesk text-[10px] font-semibold text-white/80 uppercase tracking-[0.1em]">
            {isHovered ? 'Back' : 'Front'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="font-spaceGrotesk font-semibold text-grey1 mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="font-openSans text-grey3 text-sm leading-relaxed mb-4">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-satoshi font-black text-2xl text-grey1">
            {formattedPrice}
          </span>
          <span className="font-openSans text-xs text-grey3">
            Hover to flip
          </span>
        </div>
      </div>
    </div>
  )
}
