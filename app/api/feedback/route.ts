export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['branch_id', 'overall_rating', 'service_speed', 'staff_friendliness', 'cleanliness', 'shift']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate ratings
    const ratings = ['overall_rating', 'service_speed', 'staff_friendliness', 'cleanliness']
    for (const rating of ratings) {
      if (body[rating] < 1 || body[rating] > 5) {
        return NextResponse.json(
          { error: `${rating} must be between 1 and 5` },
          { status: 400 }
        )
      }
    }

    // Insert feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    // Check if negative feedback - trigger alert
    if (body.overall_rating <= 2) {
      // TODO: Implement email/SMS alert
      console.log('🚨 NEGATIVE FEEDBACK ALERT:', data)
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchId = searchParams.get('branch_id')
    const lowRating = searchParams.get('low_rating') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('feedback')
      .select(`
        *,
        branches (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    if (lowRating) {
      query = query.lte('overall_rating', 2)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
