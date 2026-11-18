'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const SITE_URL = 'https://myfeedback.business'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [location, setLocation] = useState('')
  const [brandColor, setBrandColor] = useState('#1D9E75')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ email: string; password: string; company: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: adminRow } = await supabase
        .from('platform_admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cancelled) return
      setAllowed(!!adminRow)
      setLoading(false)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [router])

  const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    setPassword(result)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      router.replace('/login')
      return
    }

    const res = await fetch('/api/admin/add-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        companyName,
        branchName,
        location,
        brandColor,
        email,
        password,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setBusy(false)
      return
    }

    setCreated({ email: email.trim().toLowerCase(), password, company: companyName })
    setBusy(false)
  }

  const resetForm = () => {
    setCompanyName('')
    setBranchName('')
    setLocation('')
    setBrandColor('#1D9E75')
    setEmail('')
    setPassword('')
    setCreated(null)
    setCopied(false)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!allowed) {
    return (
      <div className="p-8">
        <p className="mb-4">You do not have access to this page.</p>
        <Link href="/dashboard" className="text-primary-600 font-medium">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (created) {
    const message =
      'Welcome to My Feedback!\n\n' +
      'Your dashboard: ' + SITE_URL + '/login\n' +
      'Email: ' + created.email + '\n' +
      'Password: ' + created.password + '\n\n' +
      'After you sign in, open QR codes to download the QR code for your branch and place it where your customers can scan it.'

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg border">
          <h1 className="text-2xl font-bold mb-2">Client created</h1>
          <p className="text-gray-600 mb-4">
            {created.company} is ready. Send them this message:
          </p>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-4 mb-4">
            {message}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(message)
              setCopied(true)
            }}
            className="w-full bg-primary-600 text-white py-2 rounded font-medium mb-3"
          >
            {copied ? 'Copied' : 'Copy message'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button onClick={resetForm} className="text-primary-600 font-medium">
              Add another client
            </button>
            <Link href="/admin" className="text-gray-600">
              Back to overview
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add client</h1>
          <Link href="/admin" className="text-primary-600 font-medium">
            Back to overview
          </Link>
        </div>

        <form onSubmit={submit} className="bg-white p-6 rounded-lg border">
          <label className="block text-sm text-gray-700 mb-1">Company name</label>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block text-sm text-gray-700 mb-1">First branch name</label>
          <input
            required
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block text-sm text-gray-700 mb-1">Location (optional)</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="flex items-center gap-3 mb-4 text-sm text-gray-700">
            Brand color
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
            />
          </label>

          <label className="block text-sm text-gray-700 mb-1">Client email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block text-sm text-gray-700 mb-1">
            Password (at least 8 characters)
          </label>
          <div className="flex gap-2 mb-4">
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm"
            >
              Generate
            </button>
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary-600 text-white py-2 rounded font-medium disabled:opacity-50"
          >
            {busy ? 'Creating...' : 'Create client'}
          </button>
        </form>
      </div>
    </div>
  )
}
