'use client'

import { useState, useEffect } from 'react'
import { supabase, Branch } from '@/lib/supabase'

export default function QRCodesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">QR Codes</h1>
      
      <div className="grid gap-6">
        {branches.map((branch) => {
          const feedbackUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/feedback?branch=${branch.id}`
            : ''
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`
          
          return (
            <div key={branch.id} className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-2">{branch.name}</h3>
              <p className="text-gray-600 mb-4">{branch.location}</p>
              
              {/* eslint-disable-next-line */}
              <img src={qrUrl} alt="QR Code" className="mb-4" />
              
              <a 
                href={qrUrl} 
                download 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded mb-2"
              >
                Download QR Code
              </a>
              
              <p className="text-sm text-gray-500 mt-2 break-all">{feedbackUrl}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
