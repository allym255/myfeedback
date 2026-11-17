'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js'
import { supabase } from '@/lib/supabase'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

type Period = 'today' | 'week' | 'month'

type BranchRow = {
  id: string
  name: string
  location: string | null
}

type FeedbackRow = {
  id: string
  branch_id: string
  overall_rating: number
  service_speed: number
  staff_friendliness: number
  cleanliness: number
  comment: string | null
  shift: string | null
  created_at: string
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: '7 days' },
  { value: 'month', label: '30 days' },
]

function startOfPeriod(period: Period): Date {
  const now = new Date()
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  const days = period === 'week' ? 7 : 30
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
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

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function StatCard({
  label,
  value,
  alert,
}: {
  label: string
  value: string
  alert?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [noAccess, setNoAccess] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [branches, setBranches] = useState<BranchRow[]>([])
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [period, setPeriod] = useState<Period>('week')
  const [branchFilter, setBranchFilter] = useState('all')
  const [negativeOnly, setNegativeOnly] = useState(false)

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

      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .maybeSingle()

      const { data: branchData } = await supabase
        .from('branches')
        .select('id, name, location')
        .eq('company_id', companyId)
        .order('name')

      const branchRows = (branchData ?? []) as unknown as BranchRow[]

      let feedbackRows: FeedbackRow[] = []
      if (branchRows.length > 0) {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const { data: fbData } = await supabase
          .from('feedback')
          .select(
            'id, branch_id, overall_rating, service_speed, staff_friendliness, cleanliness, comment, shift, created_at'
          )
          .in(
            'branch_id',
            branchRows.map((b) => b.id)
          )
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(2000)
        feedbackRows = (fbData ?? []) as unknown as FeedbackRow[]
      }

      if (cancelled) return
      const companyRow = company as unknown as { name: string } | null
      setCompanyName(companyRow ? companyRow.name : '')
      setBranches(branchRows)
      setFeedback(feedbackRows)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [router])

  const branchName = useMemo(() => {
    const map: Record<string, string> = {}
    branches.forEach((b) => {
      map[b.id] = b.name
    })
    return map
  }, [branches])

  const scoped = useMemo(() => {
    const since = startOfPeriod(period).getTime()
    return feedback.filter((f) => {
      if (new Date(f.created_at).getTime() < since) return false
      if (branchFilter !== 'all' && f.branch_id !== branchFilter) return false
      return true
    })
  }, [feedback, period, branchFilter])

  const feed = useMemo(
    () => (negativeOnly ? scoped.filter((f) => f.overall_rating <= 2) : scoped),
    [scoped, negativeOnly]
  )

  const stats = useMemo(() => {
    const negatives = scoped.filter((f) => f.overall_rating <= 2).length
    return {
      total: scoped.length,
      avgOverall: average(scoped.map((f) => f.overall_rating)),
      avgSpeed: average(scoped.map((f) => f.service_speed)),
      avgStaff: average(scoped.map((f) => f.staff_friendliness)),
      avgClean: average(scoped.map((f) => f.cleanliness)),
      negatives,
    }
  }, [scoped])

  const trend = useMemo(() => {
    const days: Date[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      days.push(d)
    }
    const rows =
      branchFilter === 'all' ? feedback : feedback.filter((f) => f.branch_id === branchFilter)
    return {
      labels: days.map((d) =>
        d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
      ),
      values: days.map((d) => {
        const key = dayKey(d)
        const dayRows = rows.filter((f) => dayKey(new Date(f.created_at)) === key)
        return dayRows.length
          ? Number(average(dayRows.map((f) => f.overall_rating)).toFixed(2))
          : null
      }),
    }
  }, [feedback, branchFilter])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (noAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">No company linked</h1>
          <p className="text-gray-600 mb-4">
            Your account is not linked to a company yet. Please contact support.
          </p>
          <button onClick={signOut} className="text-primary-600 font-medium">
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {companyName || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-600">Customer feedback</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin/qr-codes" className="text-primary-600 font-medium">
              QR codes
            </Link>
            <button onClick={signOut} className="text-gray-600">
              Sign out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                period === p.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
          {branches.length > 1 && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
            >
              <option value="all">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatCard
            label="Average rating"
            value={stats.total ? stats.avgOverall.toFixed(1) : '-'}
          />
          <StatCard label="Responses" value={String(stats.total)} />
          <StatCard
            label="Negative"
            value={String(stats.negatives)}
            alert={stats.negatives > 0}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Speed" value={stats.total ? stats.avgSpeed.toFixed(1) : '-'} />
          <StatCard label="Staff" value={stats.total ? stats.avgStaff.toFixed(1) : '-'} />
          <StatCard
            label="Cleanliness"
            value={stats.total ? stats.avgClean.toFixed(1) : '-'}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Average rating, last 7 days
          </h2>
          <div className="h-56">
            <Line
              data={{
                labels: trend.labels,
                datasets: [
                  {
                    data: trend.values,
                    borderColor: '#0F6E56',
                    backgroundColor: '#0F6E56',
                    tension: 0.3,
                    spanGaps: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent feedback</h2>
            <button
              onClick={() => setNegativeOnly(!negativeOnly)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                negativeOnly ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {negativeOnly ? 'Showing negative only' : 'Show negative only'}
            </button>
          </div>

          <div className="space-y-3">
            {feed.slice(0, 50).map((f) => (
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
                  <span className="text-xs text-gray-500 text-right capitalize">
                    {branchName[f.branch_id]}
                    {f.shift ? ` · ${f.shift}` : ''} · {timeAgo(f.created_at)}
                  </span>
                </div>
                {f.comment && (
                  <p className="text-sm text-gray-700 italic mt-1">&quot;{f.comment}&quot;</p>
                )}
              </div>
            ))}
            {feed.length === 0 && (
              <p className="text-sm text-gray-500">No feedback for this selection yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
