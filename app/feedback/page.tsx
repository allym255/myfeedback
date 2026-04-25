'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase, Branch } from '@/lib/supabase'

export default function FeedbackPage() {
  const searchParams = useSearchParams()
  const branchId = searchParams.get('branch')
  
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [ratings, setRatings] = useState({
    overall: 0,
    speed: 0,
    staff: 0,
    clean: 0
  })
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (branchId) {
      fetchBranch()
    }
  }, [branchId])

  const fetchBranch = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .single()

      if (error) throw error
      setBranch(data)
    } catch (error) {
      console.error('Error fetching branch:', error)
    } finally {
      setLoading(false)
    }
  }

  const getShift = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    return 'evening'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            branch_id: branchId,
            overall_rating: ratings.overall,
            service_speed: ratings.speed,
            staff_friendliness: ratings.staff,
            cleanliness: ratings.clean,
            comment: comment.trim() || null,
            shift: getShift()
          }
        ])

      if (error) throw error
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = () => {
    return ratings.overall > 0 && ratings.speed > 0 && ratings.staff > 0 && ratings.clean > 0
  }

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number
    onChange: (val: number) => void
    label: string 
  }) => {
    const [hover, setHover] = useState(0)
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-3">
          {label}
        </label>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-4xl transition-transform hover:scale-110 focus:outline-none"
            >
              {star <= (hover || value) ? '★' : '☆'}
            </button>
          ))}
        </div>
        {value > 0 && (
          <p className="text-center text-sm text-gray-600 mt-2">
            {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value - 1]}
          </p>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Branch Not Found</h1>
          <p className="text-gray-600">Please scan a valid QR code</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600 mb-8">
              Your feedback helps us serve you better. We appreciate you taking the time.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setRatings({ overall: 0, speed: 0, staff: 0, clean: 0 })
                setComment('')
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-2">Share Your Experience</h1>
          <p className="text-primary-100">{branch.name}</p>
          <p className="text-sm text-primary-200">{branch.location}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
          <StarRating
            label="Overall Experience"
            value={ratings.overall}
            onChange={(val) => setRatings({ ...ratings, overall: val })}
          />

          <div className="border-t border-gray-100 my-6"></div>

          <StarRating
            label="Service Speed"
            value={ratings.speed}
            onChange={(val) => setRatings({ ...ratings, speed: val })}
          />

          <div className="border-t border-gray-100 my-6"></div>

          <StarRating
            label="Staff Friendliness"
            value={ratings.staff}
            onChange={(val) => setRatings({ ...ratings, staff: val })}
          />

          <div className="border-t border-gray-100 my-6"></div>

          <StarRating
            label="Cleanliness"
            value={ratings.clean}
            onChange={(val) => setRatings({ ...ratings, clean: val })}
          />

          <div className="border-t border-gray-100 my-6"></div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || submitting}
            className="w-full bg-primary-600 text-white py-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}
