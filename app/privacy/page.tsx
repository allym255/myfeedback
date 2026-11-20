import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: 19 November 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who we are</h2>
            <p>
              My Feedback (myfeedback.business) provides a customer feedback service to
              restaurants, cafes and other businesses (the &quot;Businesses&quot;). Guests
              scan a QR code and leave a rating for the Business. You can contact us at
              dineboostuae@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              2. Guests who leave feedback
            </h2>
            <p className="mb-2">When you submit feedback we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your star ratings and your optional written comment</li>
              <li>The date and time of the feedback</li>
              <li>Technical information such as your IP address and browser or device type</li>
            </ul>
            <p className="mt-2">
              We do not ask for your name, phone number, email address or any account. Please
              do not include personal details in your comment. We use the technical
              information to protect against fake or repeated reviews, for example by
              allowing one review per hour for each location from the same connection.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Business users</h2>
            <p>
              For Business users who sign in to the dashboard we store the email address, the
              company and branch details, and a password that is stored in protected form by
              our authentication provider.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Who can see the data</h2>
            <p>
              The Business that you reviewed can see the ratings and comments for its own
              branches. It does not see your IP address. The people who operate the service
              can access data to run the service, provide support and keep it secure. We do
              not sell data and we do not use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Service providers</h2>
            <p>
              We use trusted providers to run the service: Supabase (database and sign-in),
              Vercel (website hosting) and Resend (sending email notifications to
              Businesses). Data may be processed on servers outside the United Arab Emirates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              6. Cookies and tracking
            </h2>
            <p>
              We do not use advertising or analytics trackers. When a Business user signs in,
              the browser stores a session so that the user stays signed in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. How long we keep data</h2>
            <p>
              We keep feedback for as long as the Business uses the service. When a Business
              closes its account we delete its data on request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Your rights</h2>
            <p>
              You can ask us to give you access to, correct or delete personal data we hold
              about you, in line with applicable UAE data protection law. Because feedback is
              not linked to your name, please tell us the venue, the date and the time of
              your feedback so that we can find it. Write to dineboostuae@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Security</h2>
            <p>
              Data is sent over encrypted connections, and access is restricted so that each
              Business can only see its own data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Changes</h2>
            <p>
              We may update this policy. The date at the top shows when it was last changed.
            </p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-sm">
          <Link href="/terms" className="text-primary-600 font-medium">
            Terms of Service
          </Link>
          <Link href="/login" className="text-gray-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
