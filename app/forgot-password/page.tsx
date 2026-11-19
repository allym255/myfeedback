'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/reset-password',
    })

    if (resetError) {
      setError('Could not send the email. Please try again in a few minutes.')
      setBusy(false)
      return
    }

    setSent(true)
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h1>

        {sent ? (
          <div>
            <p className="text-gray-700 mt-4 mb-6">
              If an account exists for that email, we have sent a link to reset the
              password. Please check your inbox and spam folder.
            </p>
            <Link href="/login" className="text-primary-600 font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="text-sm text-gray-600 mb-6">
              Enter your email and we will send you a link to choose a new password.
            </p>

            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-primary-600 text-white py-2 rounded font-medium disabled:opacity-50 mb-4"
            >
              {busy ? 'Sending...' : 'Send reset link'}
            </button>

            <Link href="/login" className="text-sm text-gray-600">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
