import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Segwae',
  description: 'Segwae terms of service and user agreement',
}

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-satoshi font-black text-5xl mb-8">Terms of Service</h1>
      <p className="font-openSans text-grey2 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-lg max-w-none font-openSans">
        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">1. Acceptance of Terms</h2>
          <p className="text-grey2 leading-relaxed">
            By accessing or using Segwae, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">2. Description of Service</h2>
          <p className="text-grey2 mb-3">Segwae is a professional networking platform that allows users to:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Create digital business cards with QR codes</li>
            <li>Connect with other professionals</li>
            <li>Order physical NFC business cards</li>
            <li>Share profile information and social links</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">3. User Accounts</h2>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Registration</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>You must provide accurate and complete information</li>
            <li>You must be at least 13 years old to use Segwae</li>
            <li>One person may only maintain one account</li>
          </ul>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Account Security</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You are responsible for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">4. Subscription Plans</h2>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Free Plan</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Access to basic features</li>
            <li>Auto-generated username</li>
            <li>Unlimited connections</li>
          </ul>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Premium Plan (₦2,500/month or ₦25,000/year)</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Custom username</li>
            <li>Priority support</li>
            <li>Early access to new features</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">5. Physical Card Orders</h2>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Orders</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>All orders are subject to product availability</li>
            <li>Prices are in Nigerian Naira (₦)</li>
            <li>Payment must be completed before processing</li>
          </ul>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Shipping</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Currently available in Nigeria only</li>
            <li>Delivery times are estimates, not guarantees</li>
            <li>We are not responsible for delays beyond our control</li>
          </ul>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Returns and Refunds</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Physical cards cannot be returned once printed</li>
            <li>Refunds available only for unprocessed orders</li>
            <li>Contact support within 24 hours of placing order for cancellation</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">6. User Content</h2>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Your Content</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>You retain ownership of your profile content</li>
            <li>You grant us license to use, display, and distribute your content</li>
            <li>You are responsible for the accuracy of your information</li>
          </ul>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3">Prohibited Content</h3>
          <p className="text-grey2 mb-3">You may not post content that:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Violates laws or regulations</li>
            <li>Infringes intellectual property rights</li>
            <li>Contains false or misleading information</li>
            <li>Is offensive, abusive, or harassing</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">7. Connections and Networking</h2>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Connections are created automatically when someone views your profile</li>
            <li>You cannot disconnect from other users (no block feature currently)</li>
            <li>Connections are permanent once established</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">8. Privacy</h2>
          <p className="text-grey2">
            Your use of Segwae is also governed by our Privacy Policy, available at{' '}
            <a href="/privacy-policy" className="text-mainPurple hover:underline">
              segwae.com/privacy-policy
            </a>
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">9. Prohibited Uses</h2>
          <p className="text-grey2 mb-3">You may not:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Use the service for illegal purposes</li>
            <li>Impersonate others</li>
            <li>Spam or harass other users</li>
            <li>Attempt to hack or compromise our systems</li>
            <li>Scrape or collect user data without permission</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">10. Intellectual Property</h2>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Segwae and its original content are protected by copyright and trademark laws</li>
            <li>Our logo, trademarks, and branding may not be used without permission</li>
            <li>User-generated content belongs to the respective users</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">11. Termination</h2>
          <p className="text-grey2 mb-3">We may terminate or suspend your account at any time for:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Violation of these Terms</li>
            <li>Fraudulent activity</li>
            <li>Extended periods of inactivity</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">12. Disclaimer of Warranties</h2>
          <p className="text-grey2">
            Segwae is provided "as is" without warranties of any kind, either express or implied.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">13. Limitation of Liability</h2>
          <p className="text-grey2">
            To the maximum extent permitted by law, Segwae shall not be liable for any indirect, incidental, or consequential damages.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">14. Changes to Terms</h2>
          <p className="text-grey2">
            We reserve the right to modify these Terms at any time. Continued use of the service constitutes acceptance of modified Terms.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">15. Governing Law</h2>
          <p className="text-grey2">
            These Terms are governed by the laws of Nigeria.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">16. Contact Information</h2>
          <p className="text-grey2 mb-3">For questions about these Terms, contact us at:</p>
          <ul className="list-none text-grey2 space-y-2">
            <li>Email: support@segwae.com</li>
            <li>Website: <a href="/contact" className="text-mainPurple hover:underline">segwae.com/contact</a></li>
          </ul>
        </section>
      </div>
    </div>
  )
}