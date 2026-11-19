'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!user) {
        router.replace('/login')
        return
      }
      if (cancelled) return
      setEmail(user.email || '')
      setLoading(false)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }

    setBusy(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('Could not update the password: ' + updateError.message)
    } else {
      setMessage('Password updated.')
      setPassword('')
      setConfirm('')
    }
    setBusy(false)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Account</h1>
          <Link href="/dashboard" className="text-primary-600 font-medium text-sm">
            Back
          </Link>
        </div>

        <form onSubmit={submit} className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Signed in as <span className="font-medium text-gray-900">{email}</span>
          </p>

          <label className="block text-sm text-gray-700 mb-1">New password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block text-sm text-gray-700 mb-1">Confirm new password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {message && <p className="text-sm text-green-700 mb-4">{message}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary-600 text-white py-2 rounded font-medium disabled:opacity-50"
          >
            {busy ? 'Saving...' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  )
}
