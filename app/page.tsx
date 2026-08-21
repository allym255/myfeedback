import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Localizer</h1>
          <p className="text-gray-600">Customer feedback made simple</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/feedback?branch=123e4567-e89b-12d3-a456-426614174000"
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-primary-500 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Customer Feedback</h2>
            <p className="text-sm text-gray-600">Submit a feedback form (usually opened via QR code)</p>
          </Link>

          <Link
            href="/dashboard"
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-primary-500 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Manager Dashboard</h2>
            <p className="text-sm text-gray-600">View analytics and recent feedback</p>
          </Link>

          <Link
            href="/admin/qr-codes"
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-primary-500 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">QR Codes</h2>
            <p className="text-sm text-gray-600">Generate and download QR codes per branch</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
