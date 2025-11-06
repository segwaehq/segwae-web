import { getProducts } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import StoreClient from './StoreClient'

export const metadata = {
  title: 'NFC Card Store - Segwae',
  description: 'Browse our collection of premium NFC business cards that link to your digital profile.',
}

export default async function StorePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-grey6">
      
      {/* Hero Section */}
      <section className="bg-linear-to-br from-mainPurple to-blue text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-satoshi font-black text-4xl md:text-6xl mb-4">
            NFC Business Cards
          </h1>
          <p className="font-spaceGrotesk text-lg md:text-xl max-w-2xl mx-auto">
            Premium NFC cards that connect your physical and digital presence. Tap to share your Segwae profile instantly.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-spaceGrotesk text-xl text-grey2">
                No products available at the moment. Check back soon!
              </p>
            </div>
          ) : (
            <StoreClient products={products} />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-satoshi font-bold text-3xl md:text-4xl mb-4">
            Ready to order?
          </h2>
          <p className="font-openSans text-grey2 text-lg mb-8">
            Download the Segwae app to create your profile and order your custom NFC card.
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.segwae.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-mainPurple text-white px-8 py-4 rounded-full font-spaceGrotesk font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
          >
            Download App to Order
          </a>
        </div>
      </section>
    </div>
  )
}
