'use client'

import { useState, useEffect } from 'react'
import { supabase, Branch } from '@/lib/supabase'
import QRCode from 'qrcode'

export default function QRCodesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({})

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
      
      // Generate QR codes for all branches
      data?.forEach(branch => generateQR(branch.id))
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQR = async (branchId: string) => {
    try {
      const url = `${window.location.origin}/feedback?branch=${branchId}`
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1D9E75',
          light: '#FFFFFF'
        }
      })
      setQrCodes(prev => ({ ...prev, [branchId]: qrDataUrl }))
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const downloadQR = (branchId: string, branchName: string) => {
    const qrDataUrl = qrCodes[branchId]
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `qr-${branchName.toLowerCase().replace(/\s+/g, '-')}.png`
    link.click()
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
            Generate QR codes for your branches. Customers can scan these to submit feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{branch.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{branch.location}</p>
              
              {qrCodes[branch.id] ? (
                <div className="mb-4">
                  <img
                    src={qrCodes[branch.id]}
                    alt={`QR Code for ${branch.name}`}
                    className="w-full max-w-xs mx-auto"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse mb-4"></div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => downloadQR(branch.id, branch.name)}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Download QR Code
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/feedback?branch=${branch.id}`
                    navigator.clipboard.writeText(url)
                    alert('Link copied to clipboard!')
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>
          ))}
        </div>

        {branches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No branches found. Add some branches first.</p>
            <a
              href="/admin/branches"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Manage Branches →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
