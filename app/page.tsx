import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Localizer
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Real-time customer feedback system for hospitality businesses
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Link
              href="/feedback?branch=123e4567-e89b-12d3-a456-426614174000"
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-2xl font-semibold mb-2">Customer Feedback</h2>
              <p className="text-gray-600">
                Share your experience and help us improve
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold mb-2">Manager Dashboard</h2>
              <p className="text-gray-600">
                View analytics and customer insights
              </p>
            </Link>
          </div>

          <div className="mt-16 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/branches"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Manage Branches
              </Link>
              <Link
                href="/admin/qr-codes"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Generate QR Codes
              </Link>
              <Link
                href="/api/feedback"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                API Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
