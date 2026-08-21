  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branchId,
          overall_rating: ratings.overall,
          service_speed: ratings.speed,
          staff_friendliness: ratings.staff,
          cleanliness: ratings.clean,
          comment: comment.trim() || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to submit feedback. Please try again.')
        return
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
