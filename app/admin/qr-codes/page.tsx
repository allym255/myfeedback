'use client'

/* eslint-disable @next/next/no-img-element */
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

  const copyLink = (branchId: string) => {
    const url = `${window.location.origin}/feedback?branch=${branchId}`
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
          <p className="text-gray-600">
            Generate QR codes for your branches. Use the links below to create QR codes with a free online tool.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => {
            const feedbackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/feedback?branch=${branch.id}`
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`
            
            return (
              <div key={branch.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{branch.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{branch.location}</p>
                
                <div className="mb-4 bg-white p-4 rounded border border-gray-200">
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code for ${branch.name}`}
                    className="w-full max-w-xs mx-auto"
                  />
                </div>

                <div className="space-y-2">
                  
                    href={qrCodeUrl}
                    download={`qr-${branch.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                    className="w-full block text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Download QR Code
                  </a>
                  <button
                    onClick={() => copyLink(branch.id)}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Copy Link
                  </button>
                  <p className="text-xs text-gray-500 break-all mt-2">
                    {feedbackUrl}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {branches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No branches found. Add some branches first.</p>
          </div>
        )}
      </div>
    </div>
  )
}
