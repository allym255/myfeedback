import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type CompanyRow = { id: string; name: string }
type BranchRow = { id: string; name: string; company_id: string | null }
type MemberRow = { company_id: string; user_id: string }
type FeedbackRow = {
  branch_id: string
  overall_rating: number
  service_speed: number
  staff_friendliness: number
  cleanliness: number
  comment: string | null
  created_at: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
}

function statsFor(rows: FeedbackRow[]) {
  return {
    count: rows.length,
    overall: average(rows.map((r) => r.overall_rating)),
    speed: average(rows.map((r) => r.service_speed)),
    staff: average(rows.map((r) => r.staff_friendliness)),
    clean: average(rows.map((r) => r.cleanliness)),
    negative: rows.filter((r) => r.overall_rating <= 2).length,
  }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Dubai',
  })
}

function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function commentBlock(title: string, row: FeedbackRow, branchName: string, color: string): string {
  return (
    '<div style="margin:12px 0;padding:12px;background:#f3f4f6;border-left:4px solid ' + color + ';border-radius:6px">' +
    '<p style="margin:0 0 4px;font-size:12px;color:#555">' + title + ' · ' + escapeHtml(branchName) + '</p>' +
    '<p style="margin:0 0 4px;color:' + color + '">' + stars(row.overall_rating) + '</p>' +
    '<p style="margin:0;font-style:italic">&quot;' + escapeHtml((row.comment || '').trim()) + '&quot;</p>' +
    '</div>'
  )
}

export async function GET(request: NextRequest) {
  const secret = (process.env.CRON_SECRET || '').trim()
  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  const queryKey = request.nextUrl.searchParams.get('secret') || ''

  if (!secret || (bearer !== secret && queryKey !== secret)) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const resendKey = (process.env.RESEND_API_KEY || '').trim()
  if (!url || !key || !resendKey) {
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 })
  }

  const from = (process.env.ALERT_FROM || '').trim() || 'My Feedback <onboarding@resend.dev>'
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000

  const { data: companyData } = await supabase.from('companies').select('id, name')
  const { data: branchData } = await supabase.from('branches').select('id, name, company_id')
  const { data: memberData } = await supabase.from('company_members').select('company_id, user_id')
  const { data: feedbackData } = await supabase
    .from('feedback')
    .select(
      'branch_id, overall_rating, service_speed, staff_friendliness, cleanliness, comment, created_at'
    )
    .gte('created_at', new Date(twoWeeksAgo).toISOString())
    .limit(20000)

  const companies = (companyData ?? []) as unknown as CompanyRow[]
  const branches = (branchData ?? []) as unknown as BranchRow[]
  const members = (memberData ?? []) as unknown as MemberRow[]
  const feedback = (feedbackData ?? []) as unknown as FeedbackRow[]

  const emailCache = new Map<string, string | null>()
  const getEmail = async (userId: string): Promise<string | null> => {
    if (emailCache.has(userId)) return emailCache.get(userId) ?? null
    const { data } = await supabase.auth.admin.getUserById(userId)
    const email = data && data.user ? data.user.email ?? null : null
    emailCache.set(userId, email)
    return email
  }

  const weekStart = new Date(weekAgo)
  const weekEnd = new Date(now)
  let sent = 0
  let skipped = 0
  const failures: string[] = []

  for (const company of companies) {
    const companyBranches = branches.filter((b) => b.company_id === company.id)
    const branchIds = new Set(companyBranches.map((b) => b.id))
    const branchName: Record<string, string> = {}
    companyBranches.forEach((b) => {
      branchName[b.id] = b.name
    })

    const emails: string[] = []
    for (const m of members.filter((x) => x.company_id === company.id)) {
      const email = await getEmail(m.user_id)
      if (email) emails.push(email)
    }
    if (emails.length === 0 || companyBranches.length === 0) {
      skipped++
      continue
    }

    const rows = feedback.filter((f) => branchIds.has(f.branch_id))
    const thisWeek = rows.filter((f) => new Date(f.created_at).getTime() >= weekAgo)
    const lastWeek = rows.filter((f) => {
      const t = new Date(f.created_at).getTime()
      return t >= twoWeeksAgo && t < weekAgo
    })

    const cur = statsFor(thisWeek)
    const prev = statsFor(lastWeek)

    let changeHtml = ''
    if (cur.count > 0 && prev.count > 0) {
      const diff = cur.overall - prev.overall
      const up = diff >= 0
      changeHtml =
        '<span style="color:' + (up ? '#15803d' : '#b91c1c') + ';font-size:14px">' +
        (up ? '+' : '') + diff.toFixed(1) + ' vs last week</span>'
    }

    const withComments = thisWeek.filter((f) => f.comment && f.comment.trim())
    const best = [...withComments].sort(
      (a, b) =>
        b.overall_rating - a.overall_rating ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    const lowest = [...withComments].sort(
      (a, b) =>
        a.overall_rating - b.overall_rating ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    let body = ''
    if (cur.count === 0) {
      body =
        '<p>No feedback was received this week. Make sure your QR code is visible at the tables or counter, and ask your team to mention it to guests.</p>'
    } else {
      body +=
        '<table style="width:100%;border-collapse:collapse;margin:12px 0"><tr>' +
        '<td style="padding:12px;background:#f3f4f6;border-radius:8px;text-align:center"><div style="font-size:12px;color:#555">Average rating</div><div style="font-size:26px;font-weight:bold">' +
        cur.overall.toFixed(1) + '</div>' + changeHtml + '</td>' +
        '<td style="width:8px"></td>' +
        '<td style="padding:12px;background:#f3f4f6;border-radius:8px;text-align:center"><div style="font-size:12px;color:#555">Responses</div><div style="font-size:26px;font-weight:bold">' +
        cur.count + '</div><span style="font-size:14px;color:#555">last week: ' + prev.count + '</span></td>' +
        '<td style="width:8px"></td>' +
        '<td style="padding:12px;background:#f3f4f6;border-radius:8px;text-align:center"><div style="font-size:12px;color:#555">Negative (1-2 stars)</div><div style="font-size:26px;font-weight:bold;color:' +
        (cur.negative > 0 ? '#b91c1c' : '#111') + '">' + cur.negative + '</div></td>' +
        '</tr></table>'

      body +=
        '<p style="color:#444;margin:8px 0">Speed ' + cur.speed.toFixed(1) +
        ' · Staff ' + cur.staff.toFixed(1) +
        ' · Cleanliness ' + cur.clean.toFixed(1) + '</p>'

      if (companyBranches.length > 1) {
        body += '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px">'
        body += '<tr style="color:#555;text-align:left"><th style="padding:6px 0">Branch</th><th>Responses</th><th>Average</th></tr>'
        companyBranches.forEach((b) => {
          const s = statsFor(thisWeek.filter((f) => f.branch_id === b.id))
          body +=
            '<tr style="border-top:1px solid #e5e7eb"><td style="padding:6px 0">' +
            escapeHtml(b.name) + '</td><td>' + s.count + '</td><td>' +
            (s.count ? s.overall.toFixed(1) : '-') + '</td></tr>'
        })
        body += '</table>'
      }

      if (best) body += commentBlock('Best comment', best, branchName[best.branch_id] || '', '#15803d')
      if (lowest && lowest !== best && lowest.overall_rating <= 3) {
        body += commentBlock('Needs attention', lowest, branchName[lowest.branch_id] || '', '#b91c1c')
      }
    }

    const html =
      '<div style="font-family:Arial,sans-serif;max-width:520px;color:#111">' +
      '<h2 style="margin-bottom:2px">Weekly feedback summary</h2>' +
      '<p style="margin-top:0;color:#555">' + escapeHtml(company.name) + ' · ' +
      fmtDate(weekStart) + ' to ' + fmtDate(weekEnd) + '</p>' +
      body +
      '<p style="margin-top:20px"><a href="https://myfeedback.business/login">Open your dashboard</a></p>' +
      '</div>'

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + resendKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: emails,
          subject: 'Your weekly feedback summary: ' + company.name,
          html,
        }),
      })
      if (res.ok) {
        sent++
      } else {
        failures.push(company.name + ': ' + res.status)
        console.error('Weekly summary failed', company.name, res.status, await res.text())
      }
    } catch (err) {
      failures.push(company.name + ': error')
      console.error('Weekly summary error', company.name, err)
    }

    // stay under the email provider's rate limit
    await new Promise((resolve) => setTimeout(resolve, 600))
  }

  return NextResponse.json({ sent, skipped, failures })
}
