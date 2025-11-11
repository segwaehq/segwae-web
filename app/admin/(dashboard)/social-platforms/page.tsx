'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi'
import * as FaIcons from 'react-icons/fa6'

interface SocialPlatform {
  id: string
  platform_name: string
  platform_identifier: string
  icon_identifier: string
  color_hex: string
  display_order: number
  is_enabled: boolean
  url_pattern: string | null
  created_at: string
  updated_at: string
}

// Icon mapping helper
const getIconComponent = (iconId: string) => {
  // Convert icon identifier to PascalCase for react-icons
  // e.g., "linkedin-in" -> "FaLinkedinIn"
  const iconName = 'Fa' + iconId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  const IconComponent = (FaIcons as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[iconName] || FaIcons.FaLink
  return IconComponent
}

// Available icons for selection
const availableIcons = [
  { id: 'linkedin-in', name: 'LinkedIn' },
  { id: 'github', name: 'GitHub' },
  { id: 'x-twitter', name: 'X/Twitter' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'facebook-f', name: 'Facebook' },
  { id: 'dribbble', name: 'Dribbble' },
  { id: 'behance', name: 'Behance' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'globe', name: 'Globe/Global' },
  { id: 'medium', name: 'Medium' },
  { id: 'stack-overflow', name: 'Stack Overflow' },
  { id: 'figma', name: 'Figma' },
  { id: 'link', name: 'Generic Link' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'discord', name: 'Discord' },
  { id: 'slack', name: 'Slack' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'twitch', name: 'Twitch' },
]

export default function SocialPlatformsPage() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<SocialPlatform | null>(null)
  const [formData, setFormData] = useState({
    platform_name: '',
    platform_identifier: '',
    icon_identifier: 'link',
    color_hex: '#6A0DAD',
    display_order: 999,
    is_enabled: true,
    url_pattern: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch platforms
  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/admin/social-platforms')
      const data = await response.json()
      if (data.data) {
        setPlatforms(data.data)
      }
    } catch (error) {
      console.error('Error fetching platforms:', error)
      setError('Failed to fetch platforms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = editingPlatform
        ? `/api/admin/social-platforms/${editingPlatform.id}`
        : '/api/admin/social-platforms'

      const method = editingPlatform ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          url_pattern: formData.url_pattern || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save platform')
      }

      setSuccess(editingPlatform ? 'Platform updated successfully' : 'Platform created successfully')
      setShowModal(false)
      resetForm()
      fetchPlatforms()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save platform')
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this platform? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/social-platforms/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete platform')
      }

      setSuccess('Platform deleted successfully')
      fetchPlatforms()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete platform')
    }
  }

  // Toggle enabled status
  const toggleEnabled = async (platform: SocialPlatform) => {
    try {
      const response = await fetch(`/api/admin/social-platforms/${platform.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !platform.is_enabled }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle platform')
      }

      setSuccess(`Platform ${!platform.is_enabled ? 'enabled' : 'disabled'} successfully`)
      fetchPlatforms()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle platform')
    }
  }

  // Open modal for editing
  const openEditModal = (platform: SocialPlatform) => {
    setEditingPlatform(platform)
    setFormData({
      platform_name: platform.platform_name,
      platform_identifier: platform.platform_identifier,
      icon_identifier: platform.icon_identifier,
      color_hex: platform.color_hex,
      display_order: platform.display_order,
      is_enabled: platform.is_enabled,
      url_pattern: platform.url_pattern || '',
    })
    setShowModal(true)
  }

  // Reset form
  const resetForm = () => {
    setEditingPlatform(null)
    setFormData({
      platform_name: '',
      platform_identifier: '',
      icon_identifier: 'link',
      color_hex: '#6A0DAD',
      display_order: 999,
      is_enabled: true,
      url_pattern: '',
    })
    setError('')
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-grey3">Loading platforms...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-satoshi font-bold text-3xl mb-2">Social Platforms</h1>
          <p className="text-grey3 font-openSans">Manage social media platforms for user profiles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-mainPurple text-white px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        >
          <FiPlus /> Add Platform
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Platforms Table */}
      <div className="bg-white rounded-lg border border-grey4 overflow-hidden">
        <table className="w-full">
          <thead className="bg-grey6 border-b border-grey4">
            <tr>
              <th className="text-left p-4 font-spaceGrotesk text-sm font-medium text-grey2">Icon</th>
              <th className="text-left p-4 font-spaceGrotesk text-sm font-medium text-grey2">Name</th>
              <th className="text-left p-4 font-spaceGrotesk text-sm font-medium text-grey2">Identifier</th>
              <th className="text-left p-4 font-spaceGrotesk text-sm font-medium text-grey2">Color</th>
              <th className="text-left p-4 font-spaceGrotesk text-sm font-medium text-grey2">Order</th>
              <th className="text-left p-4 font-spaceGrotesk text-sm font-medium text-grey2">Status</th>
              <th className="text-left p-4 font-spaceGrotesk text-sm font-medium text-grey2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((platform) => {
              const IconComponent = getIconComponent(platform.icon_identifier)
              return (
                <tr key={platform.id} className="border-b border-grey5 hover:bg-grey6">
                  <td className="p-4">
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: platform.color_hex }}
                    />
                  </td>
                  <td className="p-4 font-openSans">{platform.platform_name}</td>
                  <td className="p-4 font-mono text-sm text-grey3">{platform.platform_identifier}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-grey4"
                        style={{ backgroundColor: platform.color_hex }}
                      />
                      <span className="font-mono text-sm text-grey3">{platform.color_hex}</span>
                    </div>
                  </td>
                  <td className="p-4 font-openSans text-grey3">{platform.display_order}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-spaceGrotesk ${
                        platform.is_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {platform.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleEnabled(platform)}
                        className="p-2 text-grey3 cursor-pointer hover:text-mainPurple transition-colors"
                        title={platform.is_enabled ? 'Disable' : 'Enable'}
                      >
                        {platform.is_enabled ? <FiEyeOff /> : <FiEye />}
                      </button>
                      <button
                        onClick={() => openEditModal(platform)}
                        className="p-2 text-grey3 cursor-pointer hover:text-blue transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(platform.id)}
                        className="p-2 text-grey3 cursor-pointer hover:text-errorRed transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {platforms.length === 0 && (
          <div className="p-8 text-center text-grey3">
            No platforms found. Add your first platform to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-grey4">
              <h2 className="font-satoshi font-bold text-2xl">
                {editingPlatform ? 'Edit Platform' : 'Add New Platform'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Platform Name */}
              <div>
                <label className="block font-spaceGrotesk text-sm font-medium mb-2">
                  Platform Name *
                </label>
                <input
                  type="text"
                  value={formData.platform_name}
                  onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                  className="w-full border border-grey4 rounded-lg px-4 py-2 font-openSans"
                  placeholder="e.g., LinkedIn, GitHub, Global"
                  required
                />
              </div>

              {/* Platform Identifier */}
              <div>
                <label className="block font-spaceGrotesk text-sm font-medium mb-2">
                  Platform Identifier * <span className="text-grey3 font-normal">(lowercase, no spaces)</span>
                </label>
                <input
                  type="text"
                  value={formData.platform_identifier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      platform_identifier: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                    })
                  }
                  className="w-full border border-grey4 rounded-lg px-4 py-2 font-mono"
                  placeholder="e.g., linkedin, github, global"
                  required
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block font-spaceGrotesk text-sm font-medium mb-2">
                  Icon *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableIcons.map((icon) => {
                    const IconComponent = getIconComponent(icon.id)
                    const isSelected = formData.icon_identifier === icon.id
                    return (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon_identifier: icon.id })}
                        className={`flex flex-col items-center gap-1 p-3 border-2 rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'border-mainPurple bg-lightPurple'
                            : 'border-grey4 hover:border-grey3'
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-xs font-openSans text-grey3 truncate w-full text-center">
                          {icon.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block font-spaceGrotesk text-sm font-medium mb-2">
                  Color *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color_hex}
                    onChange={(e) => setFormData({ ...formData, color_hex: e.target.value.toUpperCase() })}
                    className="w-20 h-10 border border-grey4 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color_hex}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase()
                      if (!value.startsWith('#')) value = '#' + value
                      setFormData({ ...formData, color_hex: value })
                    }}
                    className="flex-1 border border-grey4 rounded-lg px-4 py-2 font-mono"
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block font-spaceGrotesk text-sm font-medium mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full border border-grey4 rounded-lg px-4 py-2 font-openSans"
                  min="1"
                />
              </div>

              {/* URL Pattern */}
              <div>
                <label className="block font-spaceGrotesk text-sm font-medium mb-2">
                  URL Pattern <span className="text-grey3 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.url_pattern}
                  onChange={(e) => setFormData({ ...formData, url_pattern: e.target.value })}
                  className="w-full border border-grey4 rounded-lg px-4 py-2 font-mono text-sm"
                  placeholder="e.g., https://linkedin.com/in/{username}"
                />
                <p className="text-xs text-grey3 mt-1 font-openSans">
                  Use {'"{username}"'} as a placeholder. Leave empty for custom URLs.
                </p>
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_enabled"
                  checked={formData.is_enabled}
                  onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_enabled" className="font-spaceGrotesk text-sm">
                  Enabled (visible to users)
                </label>
              </div>

              {/* Error in modal */}
              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-grey4 rounded-lg font-spaceGrotesk hover:bg-grey6 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-mainPurple text-white rounded-lg font-spaceGrotesk cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {editingPlatform ? 'Update Platform' : 'Create Platform'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
