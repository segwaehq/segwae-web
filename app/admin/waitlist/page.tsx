'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { exportToCSV } from '@/lib/csvExport'
import { WaitlistSubscriber } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

export default function WaitlistPage() {
  const [subscribers, setSubscribers] = useState<WaitlistSubscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<WaitlistSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState('all')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSubscribers(data)
    }
    setLoading(false)
  }, [supabase])

  const filterSubscribers = useCallback(() => {
    let filtered = subscribers

    if (searchTerm) {
      filtered = filtered.filter((sub) =>
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (stateFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.state === stateFilter)
    }

    setFilteredSubscribers(filtered)
  }, [subscribers, searchTerm, stateFilter])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  useEffect(() => {
    filterSubscribers()
  }, [filterSubscribers])

  const handleExport = () => {
    const exportData = filteredSubscribers.map((sub) => ({
      Email: sub.email,
      State: sub.state,
      'Joined Date': new Date(sub.created_at).toLocaleString(),
    }))

    exportToCSV(exportData, `waitlist-${new Date().toISOString().split('T')[0]}`)
  }

  // Get unique states for filter
  const uniqueStates = Array.from(new Set(subscribers.map((s) => s.state))).sort()

  // Get state statistics
  const stateStats = subscribers.reduce((acc: Record<string, number>, sub) => {
    acc[sub.state] = (acc[sub.state] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mainPurple"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="font-satoshi font-black text-4xl">Waitlist Subscribers</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-mainPurple text-white px-6 py-3 rounded-lg font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">
            Total Subscribers
          </h3>
          <p className="font-satoshi font-black text-4xl text-mainPurple">
            {subscribers.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">
            States Covered
          </h3>
          <p className="font-satoshi font-black text-4xl text-blue">
            {uniqueStates.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">
            Top State
          </h3>
          <p className="font-satoshi font-black text-2xl text-successGreen">
            {Object.entries(stateStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-spaceGrotesk font-semibold mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
            />
          </div>
          <div>
            <label className="block font-spaceGrotesk font-semibold mb-2">Filter by State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
            >
              <option value="all">All States</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state}>
                  {state} ({stateStats[state]})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-grey2 font-openSans">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </div>
      </div>

      {/* Subscribers List */}
      {filteredSubscribers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <p className="font-spaceGrotesk text-xl text-grey2">No subscribers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-grey6 border-b border-grey4">
                <tr>
                  <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">State</th>
                  <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-grey6/50'}
                  >
                    <td className="px-6 py-4 font-openSans">{subscriber.email}</td>
                    <td className="px-6 py-4 font-openSans">{subscriber.state}</td>
                    <td className="px-6 py-4 font-openSans text-grey2">
                      {new Date(subscriber.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}