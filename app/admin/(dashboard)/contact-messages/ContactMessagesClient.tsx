'use client'

import { useState, useCallback, useEffect } from 'react'
import { exportToCSV } from '@/lib/csvExport'
import { ContactMessage } from '@/lib/types'

interface Props {
  initialMessages: ContactMessage[]
}

export default function ContactMessagesClient({ initialMessages }: Props) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages)
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>(initialMessages)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filterMessages = useCallback(() => {
    let filtered = messages

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((msg) => msg.status === statusFilter)
    }

    setFilteredMessages(filtered)
  }, [messages, searchTerm, statusFilter])

  useEffect(() => {
    filterMessages()
  }, [filterMessages])

  const handleExport = () => {
    const exportData = filteredMessages.map((msg) => ({
      Name: msg.name,
      Email: msg.email,
      Subject: msg.subject,
      Message: msg.message,
      Status: msg.status,
      'Created At': new Date(msg.created_at).toLocaleString(),
      'IP Address': msg.ip_address || 'N/A',
    }))

    exportToCSV(exportData, `contact-messages-${new Date().toISOString().split('T')[0]}`)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus as ContactMessage['status'] } : msg))
        )
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-mainPurple/10 text-mainPurple',
      read: 'bg-blue/10 text-blue',
      replied: 'bg-successGreen/10 text-successGreen',
      archived: 'bg-grey3/10 text-grey3',
    }
    return styles[status as keyof typeof styles] || styles.new
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="font-satoshi font-black text-4xl">Contact Messages</h1>
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

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-spaceGrotesk font-semibold mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
            />
          </div>
          <div>
            <label className="block font-spaceGrotesk font-semibold mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-grey4 focus:border-mainPurple focus:ring-2 focus:ring-mainPurple/20 outline-none transition-all font-openSans"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-grey2 font-openSans">
          Showing {filteredMessages.length} of {messages.length} messages
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <p className="font-spaceGrotesk text-xl text-grey2">No messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-spaceGrotesk font-bold text-xl">{message.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-spaceGrotesk font-semibold ${getStatusBadge(
                        message.status
                      )}`}
                    >
                      {message.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-grey2 font-openSans">
                    <span>{message.email}</span>
                    <span className="hidden md:inline">•</span>
                    <span>{new Date(message.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-grey6 rounded-xl p-4 mb-4">
                <p className="font-spaceGrotesk font-semibold text-sm text-grey2 mb-1">
                  Subject: {message.subject}
                </p>
                <p className="font-openSans text-grey1 whitespace-pre-wrap">{message.message}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${message.email}`}
                  className="bg-mainPurple text-white px-4 py-2 rounded-lg font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all"
                >
                  Reply via Email
                </a>
                <select
                  value={message.status}
                  onChange={(e) => updateStatus(message.id, e.target.value)}
                  className="px-4 py-2 rounded-lg border border-grey4 font-spaceGrotesk focus:border-mainPurple outline-none transition-all"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
