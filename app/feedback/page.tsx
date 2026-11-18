'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type BranchInfo = {
  id: string
  name: string
  location: string | null
  brand_color: string | null
  logo_url: string | null
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

function StarRow({
  title,
  value,
  onChange,
  color,
}: {
  title: string
  value: number
  onChange: (n: number) => void
  color: string
}) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-b-0">
      <p className="font-medium text-gray-900 mb-3">{title}</p>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={n + ' stars'}
            className="text-4xl leading-none p-1"
            style={{ color: n <= value ? color : '#D1D5DB' }}
          >
            ★
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">{LABELS[value]}</p>
    </div>
  )
}

function FeedbackForm() {
  const searchParams = useSearchParams()
  const branchId = searchParams.get('branch')

  const [branch, setBranch] = useState<BranchInfo | null | undefined>(undefined)
  const [overall, setOverall] = useState(5)
  const [speed, setSpeed] = useState(5)
  const [staff, setStaff] = useState(5)
  const [clean, setClean] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!branchId) {
        setBranch(null)
        return
      }
      const { data } = await supabase
        .from('branches')
        .select('id, name, location, brand_color, logo_url')
        .eq('id', branchId)
        .maybeSingle()

      if (cancelled) return
      setBranch(data ? (data as unknown as BranchInfo) : null)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [branchId])

  if (branch === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (branch === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-700 text-center">This feedback link is not valid.</p>
      </div>
    )
  }

  const color = branch.brand_color || '#1D9E75'

  const header = (
    <div className="px-6 py-8 text-center text-white" style={{ backgroundColor: color }}>
      {branch.logo_url && (
        <div className="inline-block bg-white rounded-xl p-3 mb-4">
          {/* eslint-disable-next-line */}
          <img
            src={branch.logo_url}
            alt={branch.name}
            className="max-h-16 max-w-[200px] object-contain"
          />
        </div>
      )}
      <h1 className="text-2xl font-bold">{branch.name}</h1>
      {branch.location && <p className="text-sm opacity-90 mt-1">{branch.location}</p>}
    </div>
  )

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow overflow-hidden">
          {header}
          <div className="px-6 py-10 text-center">
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl"
              style={{ backgroundColor: color }}
            >
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h2>
            <p className="text-gray-600">Your feedback helps us improve.</p>
          </div>
        </div>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branch.id,
          overall_rating: overall,
          service_speed: speed,
          staff_friendliness: staff,
          cleanliness: clean,
          comment: comment.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow overflow-hidden">
        {header}

        <form onSubmit={submit} className="px-6 pb-6 pt-2">
          <StarRow title="Overall Experience" value={overall} onChange={setOverall} color={color} />
          <StarRow title="Service Speed" value={speed} onChange={setSpeed} color={color} />
          <StarRow title="Staff Friendliness" value={staff} onChange={setStaff} color={color} />
          <StarRow title="Cleanliness" value={clean} onChange={setClean} color={color} />

          <div className="py-5">
            <label className="block font-medium text-gray-900 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell us more about your experience..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white py-3 rounded-lg font-semibold disabled:opacity-60"
            style={{ backgroundColor: color }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <FeedbackForm />
    </Suspense>
  )
}
