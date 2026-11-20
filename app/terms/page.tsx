import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: 19 November 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. The service</h2>
            <p>
              My Feedback (myfeedback.business) lets a business collect customer feedback
              through QR codes and view the results in a dashboard. These terms apply to
              businesses that use the service (&quot;you&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Your account</h2>
            <p>
              You are responsible for keeping your login details secure and for everything
              done with your account. Tell us straight away if you think someone else has
              used it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Acceptable use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submit fake feedback or ask others to do so</li>
              <li>Try to get around the limits that protect against repeated reviews</li>
              <li>Try to access data that belongs to another business</li>
              <li>Interfere with or overload the service</li>
              <li>Use the service in a way that breaks the law</li>
            </ul>
            <p className="mt-2">
              You are responsible for how you display QR codes to guests and for how you use
              the feedback you receive.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Fees and trials</h2>
            <p>
              Prices, billing periods and any free trial are as agreed with you in writing,
              for example in a quote or a message. A trial may end after the agreed period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Your data</h2>
            <p>
              The feedback collected for your branches belongs to you. We process it only to
              provide the service, as described in our{' '}
              <Link href="/privacy" className="text-primary-600 underline">
                Privacy Policy
              </Link>
              . You can ask us for a copy of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Availability</h2>
            <p>
              We work to keep the service reliable, but we do not promise that it will always
              be available or free of errors. The service is provided as it is.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Liability</h2>
            <p>
              To the extent the law allows, we are not responsible for indirect or
              consequential losses, such as lost profit. Our total liability for any claim is
              limited to the fees you paid us in the three months before the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Ending the service</h2>
            <p>
              You can stop using the service at any time by telling us. We may suspend or end
              your access if you break these terms or do not pay agreed fees. When your
              account ends, we delete your data on request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Governing law</h2>
            <p>
              These terms are governed by the laws of the United Arab Emirates, and the courts
              of the United Arab Emirates have jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contact</h2>
            <p>Questions about these terms: dineboostuae@gmail.com.</p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-sm">
          <Link href="/privacy" className="text-primary-600 font-medium">
            Privacy Policy
          </Link>
          <Link href="/login" className="text-gray-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
