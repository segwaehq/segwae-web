import Link from 'next/link'

export const metadata = {
  title: 'About Us - Segwae',
  description: 'Learn about Segwae, the professional networking platform that makes connections effortless.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
     
      {/* Hero Section */}
      <section className="bg-linear-to-br from-lightPurple via-white to-grey6 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-satoshi font-black text-5xl md:text-6xl pb-2 mb-6 bg-linear-to-r from-mainPurple to-blue bg-clip-text text-transparent">
            About Segwae
          </h1>
          <p className="font-spaceGrotesk text-xl md:text-2xl text-grey2">
            Turning small talk into big deals
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-satoshi font-bold text-3xl md:text-4xl mb-6 text-center">
            Our Mission
          </h2>
          <p className="font-openSans text-lg text-grey2 leading-relaxed mb-6">
            Segwae is revolutionizing professional networking by making it effortless to connect, share, and grow your network. We believe that every conversation has the potential to become a valuable connection, and we&apos;re here to ensure you never miss an opportunity.
          </p>
          <p className="font-openSans text-lg text-grey2 leading-relaxed">
            Our platform combines the convenience of digital profiles with the tangibility of NFC business cards, creating a seamless networking experience for professionals, entrepreneurs, and businesses across Nigeria and beyond.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-grey6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-satoshi font-bold text-3xl md:text-4xl mb-12 text-center">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8">
              <div className="w-14 h-14 bg-mainPurple rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">🚀</span>
              </div>
              <h3 className="font-spaceGrotesk font-bold text-xl mb-3 text-center">
                Innovation
              </h3>
              <p className="font-openSans text-grey2 text-center">
                We&apos;re constantly pushing boundaries to make networking easier and more effective.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <div className="w-14 h-14 bg-blue rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">🤝</span>
              </div>
              <h3 className="font-spaceGrotesk font-bold text-xl mb-3 text-center">
                Connection
              </h3>
              <p className="font-openSans text-grey2 text-center">
                Every interaction matters. We help you build meaningful relationships that last.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <div className="w-14 h-14 bg-successGreen rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="font-spaceGrotesk font-bold text-xl mb-3 text-center">
                Privacy
              </h3>
              <p className="font-openSans text-grey2 text-center">
                Your data is yours. You control what you share and who sees it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-satoshi font-bold text-3xl md:text-4xl mb-4">
            Ready to transform your networking?
          </h2>
          <p className="font-openSans text-grey2 text-lg mb-8">
            Join thousands of professionals using Segwae to make meaningful connections.
          </p>
          <Link
            href="/"
            className="inline-block bg-mainPurple text-white px-8 py-4 rounded-full font-spaceGrotesk font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-2xl hover:scale-105 transform"
          >
            Get Started
          </Link>
        </div>
      </section>

    </div>
  )
}
