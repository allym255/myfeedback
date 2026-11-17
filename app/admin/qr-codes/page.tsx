'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const SITE_URL = 'https://myfeedback.business'

type BranchRow = {
  id: string
  name: string
  location: string | null
}

export default function QRCodesPage() {
  const router = useRouter()
  const [branches, setBranches] = useState<BranchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [noAccess, setNoAccess] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: membership } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (!membership) {
        if (!cancelled) {
          setNoAccess(true)
          setLoading(false)
        }
        return
      }

      const companyId = (membership as unknown as { company_id: string }).company_id

      const { data: branchData } = await supabase
        .from('branches')
        .select('id, name, location')
        .eq('company_id', companyId)
        .order('name')

      if (cancelled) return
      setBranches((branchData ?? []) as unknown as BranchRow[])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [router])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (noAccess) {
    return <div className="p-8">Your account is not linked to a company yet.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">QR Codes</h1>
        <Link href="/dashboard" className="text-primary-600 font-medium">
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => {
          const feedbackUrl = `${SITE_URL}/feedback?branch=${branch.id}`
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`

          return (
            <div key={branch.id} className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-1">{branch.name}</h3>
              <p className="text-gray-600 mb-4">{branch.location}</p>

              {/* eslint-disable-next-line */}
              <img src={qrUrl} alt="QR Code" className="mb-4" />

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
                  alert('Link copied')
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded"
              >
                Copy Link
              </button>

              <p className="text-xs text-gray-500 mt-3 break-all">{feedbackUrl}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
