'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type CompanyRow = { id: string; name: string }
type BranchRow = {
  id: string
  name: string
  location: string | null
  company_id: string | null
}
type MemberRow = { company_id: string }
type FeedbackRow = {
  id: string
  branch_id: string
  overall_rating: number
  comment: string | null
  created_at: string
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function statsFor(rows: FeedbackRow[]) {
  const count = rows.length
  const avg = count ? rows.reduce((a, r) => a + r.overall_rating, 0) / count : 0
  const negative = rows.filter((r) => r.overall_rating <= 2).length
  return { count, avg, negative }
}

function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function Kpi({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}

export default function AdminOverviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [branches, setBranches] = useState<BranchRow[]>([])
  const [members, setMembers] = useState<MemberRow[]>([])
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
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
        router.replace('/dashboard')
        return
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')
      const { data: branchData } = await supabase
        .from('branches')
        .select('id, name, location, company_id')
        .order('name')
      const { data: memberData } = await supabase
        .from('company_members')
        .select('company_id')

      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { data: fbData } = await supabase
        .from('feedback')
        .select('id, branch_id, overall_rating, comment, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5000)

      if (cancelled) return
      setCompanies((companyData ?? []) as unknown as CompanyRow[])
      setBranches((branchData ?? []) as unknown as BranchRow[])
      setMembers((memberData ?? []) as unknown as MemberRow[])
      setFeedback((fbData ?? []) as unknown as FeedbackRow[])
      setAllowed(true)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [router])

  const branchById = useMemo(() => {
    const map: Record<string, BranchRow> = {}
    branches.forEach((b) => {
      map[b.id] = b
    })
    return map
  }, [branches])

  const companyById = useMemo(() => {
    const map: Record<string, CompanyRow> = {}
    companies.forEach((c) => {
      map[c.id] = c
    })
    return map
  }, [companies])

  const feedbackByBranch = useMemo(() => {
    const map: Record<string, FeedbackRow[]> = {}
    feedback.forEach((f) => {
      if (!map[f.branch_id]) map[f.branch_id] = []
      map[f.branch_id].push(f)
    })
    return map
  }, [feedback])

  const totals = useMemo(() => statsFor(feedback), [feedback])
  const unassigned = branches.filter((b) => !b.company_id)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!allowed) {
    return null
  }

  const renderBranch = (branch: BranchRow) => {
    const s = statsFor(feedbackByBranch[branch.id] ?? [])
    return (
      <div
        key={branch.id}
        className="flex items-center justify-between gap-3 py-3 border-t border-gray-100"
      >
        <div>
          <p className="font-medium text-gray-900">{branch.name}</p>
          <p className="text-xs text-gray-500">{branch.location}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-900">
            {s.count ? s.avg.toFixed(1) : '-'} avg · {s.count} responses
          </p>
          <p className={s.negative > 0 ? 'text-red-600' : 'text-gray-500'}>
            {s.negative} negative
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin overview</h1>
            <p className="text-sm text-gray-600">All companies, last 30 days</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin/new-client" className="text-primary-600 font-medium">
              Add client
            </Link>
            <Link href="/admin/branches" className="text-primary-600 font-medium">
              Manage branches
            </Link>
            <Link href="/dashboard" className="text-primary-600 font-medium">
              My dashboard
            </Link>
            <button onClick={signOut} className="text-gray-600">
              Sign out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Kpi label="Companies" value={String(companies.length)} />
          <Kpi label="Branches" value={String(branches.length)} />
          <Kpi label="Responses" value={String(totals.count)} />
          <Kpi label="Negative" value={String(totals.negative)} alert={totals.negative > 0} />
        </div>

        <div className="space-y-4 mb-8">
          {companies.map((company) => {
            const companyBranches = branches.filter((b) => b.company_id === company.id)
            const companyFeedback = companyBranches.flatMap(
              (b) => feedbackByBranch[b.id] ?? []
            )
            const s = statsFor(companyFeedback)
            const memberCount = members.filter((m) => m.company_id === company.id).length

            return (
              <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{company.name}</h2>
                    <p className="text-xs text-gray-500">
                      {companyBranches.length} branch
                      {companyBranches.length === 1 ? '' : 'es'} ·{' '}
                      {memberCount > 0 ? (
                        `${memberCount} login${memberCount === 1 ? '' : 's'} linked`
                      ) : (
                        <span className="text-amber-600">No login linked yet</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-900 font-medium">
                      {s.count ? s.avg.toFixed(1) : '-'} avg
                    </p>
                    <p className="text-gray-500">{s.count} responses</p>
                  </div>
                </div>

                {companyBranches.length === 0 && (
                  <p className="text-sm text-gray-500 border-t border-gray-100 pt-3">
                    No branches yet.
                  </p>
                )}
                {companyBranches.map(renderBranch)}
              </div>
            )
          })}

          {unassigned.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-200 p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Branches with no company
              </h2>
              {unassigned.map(renderBranch)}
            </div>
          )}

          {companies.length === 0 && (
            <p className="text-gray-600">No companies yet.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Latest feedback, all companies
          </h2>
          <div className="space-y-3">
            {feedback.slice(0, 20).map((f) => {
              const branch = branchById[f.branch_id]
              const company = branch && branch.company_id ? companyById[branch.company_id] : null
              return (
                <div
                  key={f.id}
                  className={`rounded-lg p-4 border-l-4 bg-gray-50 ${
                    f.overall_rating <= 2 ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-lg ${
                        f.overall_rating <= 2 ? 'text-red-500' : 'text-yellow-500'
                      }`}
                    >
                      {stars(f.overall_rating)}
                    </span>
                    <span className="text-xs text-gray-500 text-right">
                      {company ? company.name + ' · ' : ''}
                      {branch ? branch.name : ''} · {timeAgo(f.created_at)}
                    </span>
                  </div>
                  {f.comment && (
                    <p className="text-sm text-gray-700 italic mt-1">&quot;{f.comment}&quot;</p>
                  )}
                </div>
              )
            })}
            {feedback.length === 0 && (
              <p className="text-sm text-gray-500">No feedback yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
