'use client'

import { useState, useCallback, useEffect } from 'react'
import { exportToCSV } from '@/lib/csvExport'
import { User } from '@/lib/types'

interface Props {
  initialUsers: User[]
}

export default function UsersClient({ initialUsers }: Props) {
  const [users] = useState<User[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('all')

  const filterUsers = useCallback(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter((user) => user.subscription_tier === tierFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, tierFilter])

  useEffect(() => {
    filterUsers()
  }, [filterUsers])

  const handleExport = () => {
    const exportData = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Username: user.custom_username || user.username,
      'Subscription Tier': user.subscription_tier,
      // 'Connection Count': user.connection_count || 0,
      'Joined Date': new Date(user.created_at).toLocaleString(),
    }))

    exportToCSV(exportData, `users-${new Date().toISOString().split('T')[0]}`)
  }

  const premiumCount = users.filter((u) => u.subscription_tier === 'premium').length
  const freeCount = users.filter((u) => u.subscription_tier === 'free').length

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="font-satoshi font-black text-4xl">App Users</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-mainPurple text-white px-6 py-3 rounded-lg font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">Total Users</h3>
          <p className="font-satoshi font-black text-4xl text-mainPurple">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">
            Premium Users
          </h3>
          <p className="font-satoshi font-black text-4xl text-blue">{premiumCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-2">Free Users</h3>
          <p className="font-satoshi font-black text-4xl text-successGreen">{freeCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-spaceGrotesk font-semibold mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
            />
          </div>
          <div>
            <label className="block font-spaceGrotesk font-semibold mb-2">
              Filter by Subscription
            </label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-grey2 font-openSans">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <p className="font-spaceGrotesk text-xl text-grey2">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-grey6 border-b border-grey4">
                <tr>
                  <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">Username</th>
                  <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">Tier</th>
                  {/* <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">
                    Connections
                  </th> */}
                  <th className="px-6 py-4 text-left font-spaceGrotesk font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-grey6/50'}>
                    <td className="px-6 py-4 font-openSans">{user.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-openSans">{user.email}</td>
                    <td className="px-6 py-4 font-openSans">
                      {user.custom_username || user.username}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-spaceGrotesk font-semibold ${
                          user.subscription_tier === 'premium'
                            ? 'bg-mainPurple/10 text-mainPurple'
                            : 'bg-grey3/10 text-grey3'
                        }`}
                      >
                        {user.subscription_tier?.toUpperCase() || 'FREE'}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 font-openSans text-grey2">
                      {user.connection_count || 0}
                    </td> */}
                    <td className="px-6 py-4 font-openSans text-grey2">
                      {new Date(user.created_at).toLocaleDateString()}
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
