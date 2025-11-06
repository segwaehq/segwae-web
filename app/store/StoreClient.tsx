'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'

interface StoreClientProps {
  products: Product[]
}

export default function StoreClient({ products }: StoreClientProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)

  // Format price as Naira
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(product.price / 100)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
      {/* Image Container with Hover Effect */}
      <div
        className="relative aspect-3/2 bg-grey6 cursor-pointer overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Front Image */}
        <Image
          src={product.front_image_url}
          alt={`${product.name} - Front`}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Back Image */}
        <Image
          src={product.back_image_url}
          alt={`${product.name} - Back`}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hover Indicator */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded font-openSans">
          {isHovered ? 'Back' : 'Front'}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="font-spaceGrotesk font-bold text-xl mb-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="font-openSans text-grey2 text-sm mb-4">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-satoshi font-bold text-2xl text-mainPurple">
            {formattedPrice}
          </span>
          <span className="font-openSans text-xs text-grey3">
            Hover to see back
          </span>
        </div>
      </div>
    </div>
  )
}
