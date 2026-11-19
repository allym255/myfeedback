'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [checked, setChecked] = useState(false)
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true)
        setChecked(true)
      }
    })

    const init = async () => {
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }
      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      if (data.session) setReady(true)
      setChecked(true)
    }

    init()
    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
      setBusy(false)
      return
    }

    await supabase.auth.signOut()
    setDone(true)
    setBusy(false)
  }

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Choose a new password</h1>

        {done ? (
          <div>
            <p className="text-gray-700 mb-6">
              Your password has been updated. Sign in with your new password.
            </p>
            <Link href="/login" className="text-primary-600 font-medium">
              Go to sign in
            </Link>
          </div>
        ) : !ready ? (
          <div>
            <p className="text-gray-700 mb-6">
              This link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/forgot-password" className="text-primary-600 font-medium">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
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

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-primary-600 text-white py-2 rounded font-medium disabled:opacity-50"
            >
              {busy ? 'Saving...' : 'Save new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
