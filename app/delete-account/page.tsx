import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delete Account - Segwae',
  description: 'Request deletion of your Segwae account and associated data',
}

export default function DeleteAccount() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-satoshi font-black text-5xl mb-8">Account Deletion</h1>
      <p className="font-openSans text-grey2 mb-12">
        Request deletion of your Segwae - Smart NFC Business Cards account
      </p>

      <div className="prose prose-lg max-w-none font-openSans">
        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">How to Delete Your Account</h2>
          <p className="text-grey2 leading-relaxed mb-6">
            We respect your right to delete your Segwae account and associated data. You have two options to request account deletion:
          </p>

          <div className="bg-lightPurple border-l-4 border-mainPurple p-6 rounded-r-lg mb-6">
            <h3 className="font-spaceGrotesk font-bold text-2xl mb-4 text-mainPurple">Option A: In-App Deletion (Recommended)</h3>
            <ol className="list-decimal pl-6 text-grey2 space-y-2">
              <li>Open the <strong>Segwae app</strong> on your device</li>
              <li>Navigate to <strong>Settings</strong> from the main menu</li>
              <li>Go to <strong>Account Settings</strong></li>
              <li>Tap <strong>&quot;Delete Account&quot;</strong></li>
              <li>Read the confirmation dialog and confirm deletion</li>
              <li>Your account will be deleted within <strong>24-48 hours</strong></li>
            </ol>
          </div>

          <div className="bg-grey5 border-l-4 border-grey3 p-6 rounded-r-lg">
            <h3 className="font-spaceGrotesk font-bold text-2xl mb-4 text-grey1">Option B: Email Request</h3>
            <p className="text-grey2 mb-4">Send an email to: <a href="mailto:hello@segwae.com" className="text-mainPurple hover:underline font-semibold">hello@segwae.com</a></p>
            <p className="text-grey2 mb-3">Include the following information in your email:</p>
            <ul className="list-disc pl-6 text-grey2 space-y-2">
              <li><strong>Subject:</strong> &quot;Account Deletion Request&quot;</li>
              <li><strong>Your registered email address</strong> (the one you used to sign up)</li>
              <li><strong>Your Segwae username</strong> (if applicable)</li>
              <li><strong>Reason for deletion</strong> (optional, but helps us improve)</li>
            </ul>
            <p className="text-grey2 mt-4">
              We will process your request within <strong>7 business days</strong> and send you a confirmation email when completed.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">What Data Gets Deleted</h2>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3 text-successGreen">Data Deleted Immediately:</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li><strong>Profile information:</strong> Name, title, bio, and all personal details</li>
            <li><strong>Contact information:</strong> Phone number, email address</li>
            <li><strong>Media files:</strong> Profile photos, cover images, and video introductions</li>
            <li><strong>Documents:</strong> Uploaded resumes/CVs</li>
            <li><strong>Social media links:</strong> All connected social media accounts</li>
            <li><strong>Your digital profile:</strong> Your segwae.com/username page will be permanently deactivated</li>
            <li><strong>Network data:</strong> Saved connections and contact lists</li>
            <li><strong>Account credentials:</strong> Login information and authentication data</li>
          </ul>

          <h3 className="font-spaceGrotesk font-semibold text-2xl mt-6 mb-3 text-warningYellow">Data That May Be Retained:</h3>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li><strong>Order history:</strong> Physical NFC card orders (retained for 7 years for legal and accounting requirements)</li>
            <li><strong>Payment records:</strong> Transaction history (retained per financial regulations)</li>
            <li><strong>Legal compliance data:</strong> Limited data required for fraud prevention and legal obligations (anonymized where possible)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Data Retention Timeline</h2>
          <div className="bg-grey6 p-6 rounded-lg">
            <ul className="list-none text-grey2 space-y-3">
              <li className="flex items-start">
                <span className="font-spaceGrotesk font-bold text-mainPurple mr-3 mt-1">•</span>
                <span><strong>Profile & personal data:</strong> Deleted within 48 hours</span>
              </li>
              <li className="flex items-start">
                <span className="font-spaceGrotesk font-bold text-mainPurple mr-3 mt-1">•</span>
                <span><strong>Backup systems:</strong> Completely cleared within 30 days</span>
              </li>
              <li className="flex items-start">
                <span className="font-spaceGrotesk font-bold text-mainPurple mr-3 mt-1">•</span>
                <span><strong>Order/payment records:</strong> Retained per legal requirements (up to 7 years)</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Important: Impact on Physical NFC Cards</h2>
          <div className="bg-errorRed/10 border border-errorRed/30 p-6 rounded-lg">
            <p className="text-grey1 font-semibold mb-3">⚠️ Please read carefully before deleting your account:</p>
            <ul className="list-disc pl-6 text-grey2 space-y-2">
              <li>
                <strong>Your profile link will stop working:</strong> When you delete your account, your Segwae profile username (segwae.com/yourname) will be permanently removed and deactivated.
              </li>
              <li>
                <strong>Physical NFC cards become inactive:</strong> Any physical NFC business cards you&apos;ve ordered will no longer work for sharing your profile, as the digital profile they link to will be deleted.
              </li>
              <li>
                <strong>QR codes will fail:</strong> QR codes on your physical cards will no longer direct to your profile.
              </li>
              <li>
                <strong>No refunds on cards:</strong> We cannot retrieve physical cards that have been delivered, and no refunds will be issued for cards that stop working due to account deletion.
              </li>
              <li>
                <strong>Permanent action:</strong> Once deleted, your username may become available for others to claim in the future.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Confirmation & Finalization</h2>
          <p className="text-grey2 mb-3">After processing your deletion request:</p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>You will receive a <strong>confirmation email</strong> at your registered email address when your account has been successfully deleted</li>
            <li>This email will include details about what data was deleted and what (if any) was retained for legal compliance</li>
            <li><strong className="text-errorRed">This action cannot be undone</strong> — you will need to create a new account to use Segwae again</li>
            <li>Your username will be permanently released and may become available for others to use</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Alternative: Temporarily Deactivate Account</h2>
          <p className="text-grey2 mb-3">
            If you&apos;re not ready for permanent deletion, consider temporarily deactivating your account instead:
          </p>
          <ul className="list-disc pl-6 text-grey2 space-y-2">
            <li>Your profile will be hidden from public view</li>
            <li>Your data will be preserved</li>
            <li>You can reactivate anytime by logging back in</li>
            <li>Your physical NFC cards will continue to work when you reactivate</li>
          </ul>
          <p className="text-grey2 mt-4">
            To deactivate (instead of delete), contact us at <a href="mailto:hello@segwae.com" className="text-mainPurple hover:underline">hello@segwae.com</a> with the subject &quot;Deactivate Account&quot;.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Questions or Issues?</h2>
          <p className="text-grey2 mb-3">
            If you have any questions about account deletion or need assistance with the process, please contact us:
          </p>
          <ul className="list-none text-grey2 space-y-2">
            <li><strong>Email:</strong> <a href="mailto:hello@segwae.com" className="text-mainPurple hover:underline">hello@segwae.com</a></li>
            <li><strong>Website:</strong> <a href="/contact" className="text-mainPurple hover:underline">segwae.com/contact</a></li>
          </ul>
          <p className="text-grey2 mt-4">
            Our support team is available to help you understand the implications of account deletion and answer any questions before you proceed.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-spaceGrotesk font-bold text-3xl mb-4">Related Information</h2>
          <p className="text-grey2 mb-3">For more information about how we handle your data:</p>
          <ul className="list-none text-grey2 space-y-2">
            <li>
              • <a href="/privacy-policy" className="text-mainPurple hover:underline">Privacy Policy</a> — Learn how we collect and use your data
            </li>
            <li>
              • <a href="/terms" className="text-mainPurple hover:underline">Terms of Service</a> — Review our terms and conditions
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
