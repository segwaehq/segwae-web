'use client'

import { useState, useEffect } from 'react'
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms'
import * as FaIcons from 'react-icons/fa6'
import {
  FaPlus,
  FaSpinner,
  FaPencil,
  FaTrash,
  FaXmark,
} from 'react-icons/fa6'
import { toast } from 'sonner'

interface SocialLink {
  id: string
  platform: string
  url: string
  created_at: string
}

export default function SocialLinksPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    platform: '',
    url: '',
  })

  const { platforms: dynamicPlatforms } = useSocialPlatforms()

  useEffect(() => {
    fetchSocialLinks()
  }, [])

  const fetchSocialLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/social-links')

      if (!response.ok) {
        throw new Error('Failed to fetch social links')
      }

      const data = await response.json()
      setSocialLinks(data.socialLinks)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load social links')
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconId: string) => {
    const iconName =
      'Fa' +
      iconId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')

    const IconComponent =
      (
        FaIcons as Record<
          string,
          React.ComponentType<React.SVGProps<SVGSVGElement>>
        >
      )[iconName] || FaIcons.FaLink

    return IconComponent
  }

  const getPlatformConfig = (platformIdentifier: string) => {
    const normalizedId =
      platformIdentifier.toLowerCase() === 'portfolio'
        ? 'global'
        : platformIdentifier.toLowerCase()

    const dynamicPlatform = dynamicPlatforms.find(
      (p) => p.platform_identifier === normalizedId
    )

    if (dynamicPlatform) {
      const IconComponent = getIconComponent(dynamicPlatform.icon_identifier)
      return {
        name: dynamicPlatform.platform_name,
        color: dynamicPlatform.color_hex,
        icon: IconComponent,
      }
    }

    return {
      name: normalizedId.charAt(0).toUpperCase() + normalizedId.slice(1),
      color: '#6B73FF',
      icon: FaIcons.FaLink,
    }
  }

  const openAddModal = () => {
    setEditingLink(null)
    setFormData({ platform: '', url: '' })
    setShowModal(true)
  }

  const openEditModal = (link: SocialLink) => {
    setEditingLink(link)
    setFormData({ platform: link.platform, url: link.url })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingLink(null)
    setFormData({ platform: '', url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingLink) {
        // Update existing link
        const response = await fetch(`/api/user/social-links/${editingLink.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update social link')
        }

        toast.success('Social link updated successfully')
      } else {
        // Create new link
        const response = await fetch('/api/user/social-links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create social link')
        }

        toast.success('Social link added successfully')
      }

      await fetchSocialLinks()
      closeModal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) {
      return
    }

    try {
      const response = await fetch(`/api/user/social-links/${linkId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete social link')
      }

      toast.success('Social link deleted successfully')
      await fetchSocialLinks()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete social link')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-8 h-8 text-mainPurple animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
              Social Links
            </h1>
            <p className="font-openSans text-grey3">
              Manage your social media profiles and links
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity"
          >
            <FaPlus className="w-4 h-4" />
            Add Link
          </button>
        </div>

        {/* Social Links List */}
        {socialLinks.length === 0 ? (
          <div className="text-center py-12">
            <FaIcons.FaLink className="w-16 h-16 text-grey4 mx-auto mb-4" />
            <h3 className="font-spaceGrotesk font-semibold text-xl text-grey1 mb-2">
              No social links yet
            </h3>
            <p className="font-openSans text-grey3 mb-6">
              Add your first social media profile to get started
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity"
            >
              Add Your First Link
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {socialLinks.map((link) => {
              const platformConfig = getPlatformConfig(link.platform)
              const Icon = platformConfig.icon

              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 border border-grey4 rounded-lg hover:border-mainPurple transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${platformConfig.color}20` }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: platformConfig.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-spaceGrotesk font-semibold text-grey1 mb-1">
                        {platformConfig.name}
                      </h3>
                      <p className="font-openSans text-sm text-grey3 truncate">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(link)}
                      className="p-2 text-grey1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-satoshi font-bold text-2xl text-grey1">
                {editingLink ? 'Edit Social Link' : 'Add Social Link'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-grey1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaXmark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Selector */}
              <div>
                <label
                  htmlFor="platform"
                  className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
                >
                  Platform
                </label>
                <select
                  id="platform"
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                >
                  <option value="">Select a platform</option>
                  {dynamicPlatforms.map((platform) => (
                    <option
                      key={platform.id}
                      value={platform.platform_identifier}
                    >
                      {platform.platform_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL Input */}
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
                >
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                  placeholder="https://example.com/yourprofile"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-grey4 text-grey1 rounded-lg font-spaceGrotesk font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Saving...'
                    : editingLink
                      ? 'Update Link'
                      : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
