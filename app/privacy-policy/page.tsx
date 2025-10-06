import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Segwae',
  description: 'Segwae privacy policy and data protection information',
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-satoshi font-black text-5xl mb-8">Privacy Policy</h1>
      <p className="font-openSans text-grey2 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-lg max-w-none font-openSans">
        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Introduction</h2>
          <p className="text-grey2 leading-relaxed">
            Segwae (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Information We Collect</h2>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Profile information (bio, job title, profile pictures, cover images)</li>
            <li>Social media links and portfolio URLs</li>
            <li>Professional documents (resumes, profile videos)</li>
            <li>Shipping addresses for physical card orders</li>
          </ul>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Automatically Collected Information</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Device information and unique device identifiers</li>
            <li>Usage data and analytics</li>
            <li>IP address and location data</li>
            <li>QR code scan events</li>
          </ul>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Connection Data</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Connection history and dates</li>
            <li>Favorite connections</li>
            <li>Connection sources (QR scan, direct link, in-app)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">How We Use Your Information</h2>
          <p className="text-grey2 mb-3">We use the collected information to:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Create and manage your digital business card</li>
            <li>Process your orders for physical NFC cards</li>
            <li>Send notifications about new connections</li>
            <li>Analyze usage patterns to improve our services</li>
            <li>Respond to your inquiries and support requests</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Information Sharing</h2>
          <p className="text-grey2 mb-3">We do not sell your personal information. We may share your information with:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Other users (based on your privacy settings)</li>
            <li>Service providers (payment processors, shipping partners)</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Your Privacy Controls</h2>
          <p className="text-grey2 mb-3">You can control what information is visible on your public profile:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Phone number visibility</li>
            <li>Email visibility</li>
            <li>Resume visibility</li>
            <li>Social links visibility</li>
            <li>Portfolio/website visibility</li>
            <li>Profile video visibility</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Data Security</h2>
          <p className="text-grey2 mb-3">We implement industry-standard security measures including:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Secure database with row-level security</li>
            <li>Firebase Cloud Messaging for secure push notifications</li>
            <li>Regular security audits</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Your Rights</h2>
          <p className="text-grey2 mb-3">You have the right to:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Third-Party Services</h2>
          <p className="text-grey2 mb-3">Our app uses:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li><strong>Supabase</strong> - Database and authentication</li>
            <li><strong>Firebase</strong> - Push notifications</li>
            <li><strong>Paystack</strong> - Payment processing</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Children&apos;s Privacy</h2>
          <p className="text-grey2">
            Segwae is not intended for users under 13 years of age. We do not knowingly collect information from children.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Changes to This Policy</h2>
          <p className="text-grey2">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Contact Us</h2>
          <p className="text-grey2 mb-3">If you have questions about this Privacy Policy, please contact us at:</p>
          <ul className="list-none text-grey2 space-y-2">
            <li>Email: privacy@segwae.com</li>
            <li>Website: <a href="/contact" className="text-mainPurple hover:underline">segwae.com/contact</a></li>
          </ul>
        </section>
      </div>
    </div>
  )
}