import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function rating(v: unknown): number | null {
  const n = Number(v)
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

    if (!url || !key) {
      return NextResponse.json({ error: 'Server is not configured' }, { status: 500 })
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Sends an email to every login linked to the company
    const sendLowRatingAlert = async (info: {
      companyId: string | null
      branchName: string
      overall: number
      speed: number
      staff: number
      clean: number
      comment: string | null
    }) => {
      try {
        const apiKey = (process.env.RESEND_API_KEY || '').trim()
        if (!apiKey || !info.companyId) return

        const { data: members } = await supabase
          .from('company_members')
          .select('user_id')
          .eq('company_id', info.companyId)

        const emails: string[] = []
        for (const m of members ?? []) {
          const { data } = await supabase.auth.admin.getUserById(
            (m as unknown as { user_id: string }).user_id
          )
          const email = data && data.user ? data.user.email : null
          if (email) emails.push(email)
        }
        if (emails.length === 0) return

        const from =
          (process.env.ALERT_FROM || '').trim() || 'My Feedback <onboarding@resend.dev>'
        const when = new Date().toLocaleString('en-GB', {
          timeZone: 'Asia/Dubai',
          dateStyle: 'medium',
          timeStyle: 'short',
        })

        const html =
          '<div style="font-family:Arial,sans-serif;max-width:480px">' +
          '<h2 style="color:#b91c1c;margin-bottom:4px">Low rating received</h2>' +
          '<p style="margin-top:0;color:#555">' +
          escapeHtml(info.branchName) + ' · ' + when + ' (Dubai)</p>' +
          '<p><strong>Overall:</strong> ' + info.overall + ' / 5<br>' +
          'Service speed: ' + info.speed + ' / 5<br>' +
          'Staff friendliness: ' + info.staff + ' / 5<br>' +
          'Cleanliness: ' + info.clean + ' / 5</p>' +
          (info.comment
            ? '<p style="background:#f3f4f6;padding:12px;border-radius:6px">&quot;' +
              escapeHtml(info.comment) + '&quot;</p>'
            : '') +
          '<p><a href="https://myfeedback.business/login">Open your dashboard</a></p>' +
          '</div>'

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: emails,
            subject: 'Low rating (' + info.overall + '/5) at ' + info.branchName,
            html,
          }),
        })

        if (!res.ok) {
          console.error('Alert email failed', res.status, await res.text())
        }
      } catch (err) {
        console.error('Alert email error', err)
      }
    }

    const body = await request.json()

    const branchId = String(body.branch_id ?? body.branchId ?? '')
    const overall = rating(body.overall_rating ?? body.overallRating ?? body.overall)
    const speed = rating(body.service_speed ?? body.serviceSpeed ?? body.speed)
    const staff = rating(body.staff_friendliness ?? body.staffFriendliness ?? body.staff)
    const clean = rating(body.cleanliness ?? body.clean)

    if (!branchId || !overall || !speed || !staff || !clean) {
      return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 })
    }

    const { data: branchData, error: branchError } = await supabase
      .from('branches')
      .select('id, name, company_id')
      .eq('id', branchId)
      .maybeSingle()

    if (branchError) {
      console.error('Branch lookup failed', branchError.message)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }
    if (!branchData) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }
    const branch = branchData as unknown as {
      id: string
      name: string
      company_id: string | null
    }

    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('feedback')
      .select('id')
      .eq('branch_id', branchId)
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo)
      .limit(1)

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: 'Only one review per hour is allowed for this location.' },
        { status: 429 }
      )
    }

    const hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Dubai',
      }).format(new Date())
    )
    const shift = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'

    const comment =
      typeof body.comment === 'string' && body.comment.trim()
        ? body.comment.trim().slice(0, 500)
        : null

    const { error: insertError } = await supabase.from('feedback').insert({
      branch_id: branchId,
      overall_rating: overall,
      service_speed: speed,
      staff_friendliness: staff,
      cleanliness: clean,
      comment,
      shift,
      ip_address: ip,
      user_agent: userAgent,
    })

    if (insertError) {
      console.error('Insert failed', insertError.message)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    // Alert the business when the overall rating is 1 or 2
    if (overall <= 2) {
      await sendLowRatingAlert({
        companyId: branch.company_id,
        branchName: branch.name,
        overall,
        speed,
        staff,
        clean,
        comment,
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Feedback route error', e)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
