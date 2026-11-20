'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const SITE_URL = 'https://myfeedback.business'

type CompanyRow = {
  id: string
  name: string
}

type BranchRow = {
  id: string
  name: string
  location: string | null
  company_id: string | null
  brand_color: string | null
  logo_url: string | null
  google_review_url: string | null
}

export default function AdminBranchesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [branches, setBranches] = useState<BranchRow[]>([])
  const [companyId, setCompanyId] = useState('')
  const [googleEdits, setGoogleEdits] = useState<Record<string, string>>({})

  const [newCompany, setNewCompany] = useState('')
  const [branchName, setBranchName] = useState('')
  const [branchLocation, setBranchLocation] = useState('')
  const [branchColor, setBranchColor] = useState('#1D9E75')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const loadData = useCallback(async () => {
    const { data: companyData } = await supabase
      .from('companies')
      .select('id, name')
      .order('name')
    const { data: branchData } = await supabase
      .from('branches')
      .select('id, name, location, company_id, brand_color, logo_url, google_review_url')
      .order('name')

    const companyRows = (companyData ?? []) as unknown as CompanyRow[]
    setCompanies(companyRows)
    setBranches((branchData ?? []) as unknown as BranchRow[])
    setCompanyId((current) =>
      current || companyRows.length === 0 ? current : companyRows[0].id
    )
  }, [])

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

      if (!adminRow) {
        if (!cancelled) setLoading(false)
        return
      }

      await loadData()
      if (!cancelled) {
        setAllowed(true)
        setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [router, loadData])

  const addCompany = async () => {
    const name = newCompany.trim()
    if (!name) {
      setMessage('Enter a company name first.')
      return
    }
    setBusy(true)
    setMessage('')
    const { error } = await supabase.from('companies').insert({ name })
    if (error) {
      setMessage('Could not add company: ' + error.message)
    } else {
      setNewCompany('')
      setMessage('Company added.')
      await loadData()
    }
    setBusy(false)
  }

  const addBranch = async () => {
    const name = branchName.trim()
    if (!companyId) {
      setMessage('Choose a company first.')
      return
    }
    if (!name) {
      setMessage('Enter a branch name.')
      return
    }
    setBusy(true)
    setMessage('')
    const { error } = await supabase.from('branches').insert({
      id: crypto.randomUUID(),
      name,
      location: branchLocation.trim() || null,
      company_id: companyId,
      brand_color: branchColor,
    })
    if (error) {
      setMessage('Could not add branch: ' + error.message)
    } else {
      setBranchName('')
      setBranchLocation('')
      setMessage('Branch added.')
      await loadData()
    }
    setBusy(false)
  }

  const deleteBranch = async (branch: BranchRow) => {
    const ok = window.confirm(
      'Delete ' + branch.name + '? All its feedback will be deleted too. This cannot be undone.'
    )
    if (!ok) return
    setBusy(true)
    setMessage('')
    const { error } = await supabase.from('branches').delete().eq('id', branch.id)
    if (error) {
      setMessage('Could not delete branch: ' + error.message)
    } else {
      setMessage('Branch deleted.')
      await loadData()
    }
    setBusy(false)
  }

  const uploadLogo = async (branch: BranchRow, file: File | undefined) => {
    if (!file) return
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage('Logo must be a PNG, JPG or WebP image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Logo must be smaller than 2 MB.')
      return
    }

    setBusy(true)
    setMessage('Uploading logo...')
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    const path = branch.id + '/' + Date.now() + '.' + ext

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { contentType: file.type })

    if (uploadError) {
      setMessage('Could not upload logo: ' + uploadError.message)
      setBusy(false)
      return
    }

    const { data: publicData } = supabase.storage.from('logos').getPublicUrl(path)
    const { error: updateError } = await supabase
      .from('branches')
      .update({ logo_url: publicData.publicUrl })
      .eq('id', branch.id)

    if (updateError) {
      setMessage('Could not save logo: ' + updateError.message)
    } else {
      setMessage('Logo saved.')
      await loadData()
    }
    setBusy(false)
  }

  const removeLogo = async (branch: BranchRow) => {
    setBusy(true)
    setMessage('')
    const { error } = await supabase
      .from('branches')
      .update({ logo_url: null })
      .eq('id', branch.id)
    if (error) {
      setMessage('Could not remove logo: ' + error.message)
    } else {
      setMessage('Logo removed.')
      await loadData()
    }
    setBusy(false)
  }

  const saveGoogleLink = async (branch: BranchRow) => {
    const value = (googleEdits[branch.id] ?? branch.google_review_url ?? '').trim()
    if (value && !/^https:\/\//i.test(value)) {
      setMessage('The Google link must start with https://')
      return
    }
    setBusy(true)
    setMessage('')
    const { error } = await supabase
      .from('branches')
      .update({ google_review_url: value || null })
      .eq('id', branch.id)
    if (error) {
      setMessage('Could not save Google link: ' + error.message)
    } else {
      setMessage(value ? 'Google link saved.' : 'Google link removed.')
      setGoogleEdits((prev) => {
        const next = { ...prev }
        delete next[branch.id]
        return next
      })
      await loadData()
    }
    setBusy(false)
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

  const visibleBranches = branches.filter((b) => b.company_id === companyId)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage branches</h1>
        <Link href="/admin" className="text-primary-600 font-medium">
          Back to overview
        </Link>
      </div>

      {message && (
        <div className="mb-6 rounded-lg bg-white border p-3 text-sm text-gray-800">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-bold mb-3">1. Add a company</h2>
          <input
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            placeholder="Company name"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <button
            onClick={addCompany}
            disabled={busy}
            className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Add company
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-bold mb-3">2. Add a branch</h2>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 bg-white"
          >
            {companies.length === 0 && <option value="">No companies yet</option>}
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Branch name"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <input
            value={branchLocation}
            onChange={(e) => setBranchLocation(e.target.value)}
            placeholder="Location (optional)"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <label className="flex items-center gap-3 mb-3 text-sm text-gray-700">
            Brand color
            <input
              type="color"
              value={branchColor}
              onChange={(e) => setBranchColor(e.target.value)}
            />
          </label>
          <button
            onClick={addBranch}
            disabled={busy}
            className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Add branch
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Branches of the selected company</h2>
      {visibleBranches.length === 0 && (
        <p className="text-gray-600">No branches yet for this company.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleBranches.map((branch) => {
          const feedbackUrl = `${SITE_URL}/feedback?branch=${branch.id}`
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`
          return (
            <div key={branch.id} className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-bold">{branch.name}</h3>
              <p className="text-gray-600 mb-3">{branch.location}</p>

              <div className="mb-3 rounded border p-3 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Logo</p>
                {branch.logo_url ? (
                  <div className="flex items-center justify-between gap-3">
                    {/* eslint-disable-next-line */}
                    <img
                      src={branch.logo_url}
                      alt="Logo"
                      className="max-h-14 max-w-[140px] object-contain"
                    />
                    <button
                      onClick={() => removeLogo(branch)}
                      disabled={busy}
                      className="text-xs text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">No logo yet</p>
                )}
                <label className="block mt-2 text-sm text-primary-600 font-medium cursor-pointer">
                  {branch.logo_url ? 'Replace logo' : 'Upload logo'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={busy}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files ? e.target.files[0] : undefined
                      e.target.value = ''
                      uploadLogo(branch, file)
                    }}
                  />
                </label>
              </div>

              <div className="mb-4 rounded border p-3 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Google review link (optional)</p>
                <input
                  value={googleEdits[branch.id] ?? branch.google_review_url ?? ''}
                  onChange={(e) =>
                    setGoogleEdits((prev) => ({ ...prev, [branch.id]: e.target.value }))
                  }
                  placeholder="https://g.page/r/.../review"
                  className="w-full border rounded px-2 py-1 text-sm mb-2"
                />
                <button
                  onClick={() => saveGoogleLink(branch)}
                  disabled={busy}
                  className="text-sm text-primary-600 font-medium disabled:opacity-50"
                >
                  Save Google link
                </button>
              </div>

              {/* eslint-disable-next-line */}
              <img src={qrUrl} alt="QR Code" className="mb-3" />

              <a
                href={qrUrl}
                download
                className="block text-center bg-primary-600 text-white px-4 py-2 rounded mb-2"
              >
                Download QR Code
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(feedbackUrl)
                  setMessage('Link copied.')
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded mb-2"
              >
                Copy Link
              </button>
              <button
                onClick={() => deleteBranch(branch)}
                disabled={busy}
                className="w-full text-red-600 border border-red-200 px-4 py-2 rounded disabled:opacity-50"
              >
                Delete branch
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
