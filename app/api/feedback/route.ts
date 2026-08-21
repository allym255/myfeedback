export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getShift() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  return 'evening'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { branch_id, overall_rating, service_speed, staff_friendliness, cleanliness, comment } = body

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Block repeat submissions from the same IP for the same branch within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: recent, error: checkError } = await supabase
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

    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          branch_id,
          overall_rating,
          service_speed,
          staff_friendliness,
          cleanliness,
          comment: comment?.trim() || null,
          shift: getShift(),
          ip_address: ip,
          user_agent: request.headers.get('user-agent') || null,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branch_id = searchParams.get('branch_id')
    const low_rating = searchParams.get('low_rating')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (branch_id) query = query.eq('branch_id', branch_id)
    if (low_rating === 'true') query = query.lte('overall_rating', 2)
    if (limit) query = query.limit(parseInt(limit))

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}
