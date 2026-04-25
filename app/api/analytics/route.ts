import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const branchId = searchParams.get('branch_id')
    const period = searchParams.get('period') || 'today' // today, week, month

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    // Build query
    let query = supabase
      .from('feedback')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate metrics
    const totalResponses = data?.length || 0
    
    if (totalResponses === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_responses: 0,
          avg_overall: 0,
          avg_speed: 0,
          avg_staff: 0,
          avg_cleanliness: 0,
          negative_count: 0,
          negative_percentage: 0,
          by_shift: {},
          trend: []
        }
      })
    }

    const sum = data.reduce((acc, f) => ({
      overall: acc.overall + f.overall_rating,
      speed: acc.speed + f.service_speed,
      staff: acc.staff + f.staff_friendliness,
      clean: acc.clean + f.cleanliness
    }), { overall: 0, speed: 0, staff: 0, clean: 0 })

    const negativeCount = data.filter(f => f.overall_rating <= 2).length

    // Calculate by shift
    const byShift = data.reduce((acc, f) => {
      if (!acc[f.shift]) {
        acc[f.shift] = { count: 0, avgRating: 0, sum: 0 }
      }
      acc[f.shift].count++
      acc[f.shift].sum += f.overall_rating
      return acc
    }, {} as any)

    Object.keys(byShift).forEach(shift => {
      byShift[shift].avgRating = (byShift[shift].sum / byShift[shift].count).toFixed(1)
    })

    // Calculate daily trend
    const trendMap = new Map()
    data.forEach(f => {
      const date = new Date(f.created_at).toISOString().split('T')[0]
      if (!trendMap.has(date)) {
        trendMap.set(date, { sum: 0, count: 0 })
      }
      const day = trendMap.get(date)
      day.sum += f.overall_rating
      day.count++
    })

    const trend = Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      avg_rating: (data.sum / data.count).toFixed(1)
    })).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      success: true,
      data: {
        total_responses: totalResponses,
        avg_overall: (sum.overall / totalResponses).toFixed(1),
        avg_speed: (sum.speed / totalResponses).toFixed(1),
        avg_staff: (sum.staff / totalResponses).toFixed(1),
        avg_cleanliness: (sum.clean / totalResponses).toFixed(1),
        negative_count: negativeCount,
        negative_percentage: ((negativeCount / totalResponses) * 100).toFixed(1),
        by_shift: byShift,
        trend
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
