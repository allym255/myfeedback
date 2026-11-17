export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getShift() {
  const hour =
    parseInt(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Dubai',
      }).format(new Date()),
      10
    ) % 24
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  return 'evening'
}

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Server is not configured' }, { status: 500 })
    }
    const admin = createClient(url, serviceKey)

    const body = await request.json()
    const {
      branch_id,
      overall_rating,
      service_speed,
      staff_friendliness,
      cleanliness,
      comment,
    } = body

    const ratings = [overall_rating, service_speed, staff_friendliness, cleanliness]
    if (!branch_id || ratings.some((r) => !Number.isInteger(r) || r < 1 || r > 5)) {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 })
    }

    const { data: branch } = await admin
      .from('branches')
      .select('id')
      .eq('id', branch_id)
      .maybeSingle()

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recent, error: checkError } = await admin
      .from('feedback')
      .select('id')
      .eq('branch_id', branch_id)
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo)

    if (checkError) throw checkError

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: 'Only one review per hour is allowed for this location.' },
        { status: 429 }
      )
    }

    const { error } = await admin.from('feedback').insert([
      {
        branch_id,
        overall_rating,
        service_speed,
        staff_friendliness,
        cleanliness,
        comment: typeof comment === 'string' ? comment.trim().slice(0, 500) || null : null,
        shift: getShift(),
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || null,
      },
    ])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
