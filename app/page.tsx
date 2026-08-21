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
