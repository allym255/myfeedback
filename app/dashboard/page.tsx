'use client'

import { useState, useEffect } from 'react'
import { supabase, FeedbackWithBranch } from '@/lib/supabase'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function DashboardPage() {
  const [feedback, setFeedback] = useState<FeedbackWithBranch[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackWithBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [showNegativeOnly, setShowNegativeOnly] = useState(false)

  useEffect(() => {
    fetchFeedback()
  }, [])

  useEffect(() => {
    filterByPeriod()
  }, [feedback, period])

  useEffect(() => {
    if (showNegativeOnly) {
      setFilteredFeedback(filteredFeedback.filter(f => f.overall_rating <= 2))
    } else {
      filterByPeriod()
    }
  }, [showNegativeOnly])

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          branches (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeedback(data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterByPeriod = () => {
    const now = new Date()
    let filtered = feedback

    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = feedback.filter(f => new Date(f.created_at) >= today)
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = feedback.filter(f => new Date(f.created_at) >= weekAgo)
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = feedback.filter(f => new Date(f.created_at) >= monthAgo)
    }

    setFilteredFeedback(filtered)
  }

  const calculateMetrics = () => {
    if (filteredFeedback.length === 0) {
      return {
        avgRating: 0,
        totalResponses: 0,
        negativePercent: 0,
        avgSpeed: 0,
        avgStaff: 0,
        avgCleanliness: 0
      }
    }

    const sum = filteredFeedback.reduce((acc, f) => ({
      overall: acc.overall + f.overall_rating,
      speed: acc.speed + f.service_speed,
      staff: acc.staff + f.staff_friendliness,
      clean: acc.clean + f.cleanliness
    }), { overall: 0, speed: 0, staff: 0, clean: 0 })

    const count = filteredFeedback.length
    const negativeCount = filteredFeedback.filter(f => f.overall_rating <= 2).length

    return {
      avgRating: (sum.overall / count).toFixed(1),
      totalResponses: count,
      negativePercent: ((negativeCount / count) * 100).toFixed(1),
      avgSpeed: (sum.speed / count).toFixed(1),
      avgStaff: (sum.staff / count).toFixed(1),
      avgCleanliness: (sum.clean / count).toFixed(1)
    }
  }

  const getTrendData = () => {
    const days = period === 'today' ? 1 : period === 'week' ? 7 : 30
    const labels = []
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayFeedback = filteredFeedback.filter(f => {
        const fDate = new Date(f.created_at)
        return fDate.toDateString() === date.toDateString()
      })

      if (dayFeedback.length > 0) {
        const avg = dayFeedback.reduce((sum, f) => sum + f.overall_rating, 0) / dayFeedback.length
        data.push(Number(avg.toFixed(1)))
      } else {
        data.push(0)
      }

      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
    }

    return { labels, data }
  }

  const metrics = calculateMetrics()
  const trendData = getTrendData()

  const chartData = {
    labels: trendData.labels,
    datasets: [{
      label: 'Average Rating',
      data: trendData.data,
      borderColor: '#1D9E75',
      backgroundColor: 'rgba(29, 158, 117, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#1D9E75'
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    }
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    }
    return date.toLocaleDateString()
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Last updated: just now</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'today'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                This Month
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Average Rating</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.avgRating}</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Total Responses</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalResponses}</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Negative Feedback</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.negativePercent}%</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Response Rate</p>
            <p className="text-3xl font-bold text-gray-900">23%</p>
          </div>
        </div>

        {/* Ratings by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ratings by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Overall</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.avgRating}</p>
              <p className="text-lg text-yellow-500">{renderStars(Math.round(Number(metrics.avgRating)))}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Service Speed</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.avgSpeed}</p>
              <p className="text-lg text-yellow-500">{renderStars(Math.round(Number(metrics.avgSpeed)))}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Staff</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.avgStaff}</p>
              <p className="text-lg text-yellow-500">{renderStars(Math.round(Number(metrics.avgStaff)))}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Cleanliness</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metrics.avgCleanliness}</p>
              <p className="text-lg text-yellow-500">{renderStars(Math.round(Number(metrics.avgCleanliness)))}</p>
            </div>
          </div>
        </div>

        {/* Rating Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Trend</h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
            <button
              onClick={() => setShowNegativeOnly(!showNegativeOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showNegativeOnly
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showNegativeOnly ? 'Show All' : 'Show Negative Only'}
            </button>
          </div>
          
          <div className="space-y-3">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No feedback to display
              </div>
            ) : (
              filteredFeedback.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg p-4 border-l-4 ${
                    item.overall_rating <= 2
                      ? 'bg-red-50 border-red-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <div className="flex gap-3 items-center">
                      <span className="text-lg text-yellow-500">
                        {renderStars(item.overall_rating)}
                      </span>
                      {item.overall_rating <= 2 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          ⚠ Negative
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-600">
                      <span className="capitalize">{item.shift}</span>
                      <span>{formatTime(item.created_at)}</span>
                    </div>
                  </div>
                  {item.comment && (
                    <p className="text-sm text-gray-700 italic">"{item.comment}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
