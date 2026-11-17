import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function rating(v: unknown): number | null {
  const n = Number(v)
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
}

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

    if (!url || !key) {
      return NextResponse.json(
        { error: 'Server key is missing in Vercel settings' },
        { status: 500 }
      )
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const body = await request.json()

    const branchId = String(body.branch_id ?? body.branchId ?? '')
    const overall = rating(body.overall_rating ?? body.overallRating ?? body.overall)
    const speed = rating(body.service_speed ?? body.serviceSpeed ?? body.speed)
    const staff = rating(
      body.staff_friendliness ?? body.staffFriendliness ?? body.staff
    )
    const clean = rating(body.cleanliness ?? body.clean)

    if (!branchId || !overall || !speed || !staff || !clean) {
      return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 })
    }

    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('id')
      .eq('id', branchId)
      .maybeSingle()

    if (branchError) {
      return NextResponse.json(
        { error: 'Server database error: ' + branchError.message },
        { status: 500 }
      )
    }
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
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
      return NextResponse.json(
        { error: 'Could not save: ' + insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
