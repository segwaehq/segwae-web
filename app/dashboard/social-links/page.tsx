'use client'

import { useState, useEffect } from 'react'
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms'
import * as FaIcons from 'react-icons/fa6'
import { FaPlus, FaPencil, FaTrash, FaXmark } from 'react-icons/fa6'
import { toast } from 'sonner'

interface SocialLink {
  id: string
  platform: string
  url: string
  created_at: string
}

const inputClass =
  'w-full px-4 py-3 border border-grey4 rounded-xl focus:outline-none focus:border-mainPurple focus:ring-1 focus:ring-mainPurple font-openSans text-sm text-grey1 placeholder:text-grey3 bg-white transition-colors'

export default function SocialLinksPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ platform: '', url: '' })

  const { platforms: dynamicPlatforms } = useSocialPlatforms()

  useEffect(() => { fetchSocialLinks() }, [])

  const fetchSocialLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/social-links')
      if (!response.ok) throw new Error('Failed to fetch social links')
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
      'Fa' + iconId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
    return (
      (FaIcons as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[iconName] ||
      FaIcons.FaLink
    )
  }

  const getPlatformConfig = (platformIdentifier: string) => {
    const normalizedId =
      platformIdentifier.toLowerCase() === 'portfolio' ? 'global' : platformIdentifier.toLowerCase()
    const dynamicPlatform = dynamicPlatforms.find((p) => p.platform_identifier === normalizedId)
    if (dynamicPlatform) {
      return {
        name: dynamicPlatform.platform_name,
        color: dynamicPlatform.color_hex,
        icon: getIconComponent(dynamicPlatform.icon_identifier),
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
        const response = await fetch(`/api/user/social-links/${editingLink.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update social link')
        }
        toast.success('Link updated')
      } else {
        const response = await fetch('/api/user/social-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create social link')
        }
        toast.success('Link added')
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
    if (!confirm('Delete this social link?')) return
    try {
      const response = await fetch(`/api/user/social-links/${linkId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete social link')
      toast.success('Link deleted')
      await fetchSocialLinks()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 border-[3px] border-mainPurple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      {/* Page header */}
      <div className="mb-8">
        <p className="font-spaceGrotesk text-xs font-semibold text-mainPurple uppercase tracking-[0.15em] mb-1">
          Dashboard
        </p>
        <div className="flex items-center justify-between">
          <h1 className="font-satoshi font-black text-3xl text-grey1">Social Links</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors cursor-pointer"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Add Link
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey4/60 p-8">
        {socialLinks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-grey5 flex items-center justify-center mx-auto mb-4">
              <FaIcons.FaLink className="w-6 h-6 text-grey3" />
            </div>
            <h3 className="font-spaceGrotesk font-semibold text-lg text-grey1 mb-1">
              No links yet
            </h3>
            <p className="font-openSans text-sm text-grey3 mb-6">
              Add your social profiles to let people find you online.
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] transition-colors cursor-pointer"
            >
              Add Your First Link
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {socialLinks.map((link) => {
              const config = getPlatformConfig(link.platform)
              const Icon = config.icon
              return (
                <div
                  key={link.id}
                  className="flex items-center gap-4 p-4 border border-grey4 rounded-xl hover:border-mainPurple/40 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}18` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-spaceGrotesk font-semibold text-grey1 text-sm">
                      {config.name}
                    </p>
                    <p className="font-openSans text-xs text-grey3 truncate mt-0.5">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(link)}
                      className="p-2 text-grey3 hover:text-grey1 hover:bg-grey5 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <FaPencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 text-grey3 hover:text-errorRed hover:bg-errorRed/5 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-satoshi font-black text-2xl text-grey1">
                {editingLink ? 'Edit Link' : 'Add Link'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-grey3 hover:text-grey1 hover:bg-grey5 rounded-lg transition-colors cursor-pointer"
              >
                <FaXmark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="platform" className="block text-xs font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
                  Platform
                </label>
                <select
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  required
                  className={inputClass}
                >
                  <option value="">Select a platform</option>
                  {dynamicPlatforms.map((platform) => (
                    <option key={platform.id} value={platform.platform_identifier}>
                      {platform.platform_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="url" className="block text-xs font-semibold text-grey1 mb-1.5 font-spaceGrotesk">
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  className={inputClass}
                  placeholder="https://example.com/yourprofile"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-grey4 text-grey2 rounded-xl font-spaceGrotesk font-semibold text-sm hover:border-grey3 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-mainPurple text-white rounded-xl font-spaceGrotesk font-semibold text-sm hover:bg-[#7D0FC9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {submitting ? 'Saving…' : editingLink ? 'Update' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
