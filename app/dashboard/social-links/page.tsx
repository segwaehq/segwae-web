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
  'w-full px-4 py-3 border border-[#E2E1EA] dark:border-line rounded-xl focus:outline-none focus:border-[#A98BE8] dark:focus:border-[#6a4fb0] text-sm font-medium text-[#15131C] dark:text-content placeholder:text-[#9098A3] dark:placeholder:text-content-subtle bg-white dark:bg-surface-sunken transition-colors'

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
      color: '#5A2DD4',
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
        <div className="w-7 h-7 border-[3px] border-[#5A2DD4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <div className="mb-8">
        <p className="font-satoshi text-[12px] font-bold text-[#5A2DD4] dark:text-[#b9a4f7] uppercase tracking-[0.14em] mb-1.5">
          Dashboard
        </p>
        <div className="flex items-center justify-between">
          <h1 className="font-satoshi font-black tracking-[-0.02em] text-[26px] text-[#15131C] dark:text-content">Social links</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform cursor-pointer"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Add link
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-raised rounded-[18px] border border-[#E8E8EF] dark:border-line p-8">
        {socialLinks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-[#F1F0F6] dark:bg-[#241d38] flex items-center justify-center mx-auto mb-4">
              <FaIcons.FaLink className="w-6 h-6 text-[#9098A3] dark:text-content-subtle" />
            </div>
            <h3 className="font-satoshi font-bold text-lg text-[#15131C] dark:text-content mb-1">
              No links yet
            </h3>
            <p className="text-sm text-[#9098A3] dark:text-content-subtle mb-6">
              Add your social profiles to let people find you online.
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              Add your first link
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
                  className="flex items-center gap-4 p-4 border border-[#E8E8EF] dark:border-line rounded-[14px] hover:border-[#C9BCF2] dark:hover:border-[#4a3d78] transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${config.color}18` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-satoshi font-bold text-[#15131C] dark:text-content text-sm">
                      {config.name}
                    </p>
                    <p className="text-xs text-[#9098A3] dark:text-content-subtle truncate mt-0.5">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(link)}
                      className="p-2 text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content hover:bg-[#F4F3F8] dark:hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <FaPencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 text-[#9098A3] dark:text-content-subtle hover:text-[#B6463C] dark:hover:text-[#f2857b] hover:bg-[#FBEAE8] dark:hover:bg-[#2a1512] rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-[#0F1115]/45 dark:bg-black/65 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-raised rounded-[18px] shadow-2xl p-8 w-full max-w-sm animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-satoshi font-black text-xl text-[#15131C] dark:text-content">
                {editingLink ? 'Edit link' : 'Add link'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-[#9098A3] dark:text-content-subtle hover:text-[#15131C] dark:hover:text-content hover:bg-[#F4F3F8] dark:hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              >
                <FaXmark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="platform" className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5 font-satoshi">
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
                <label htmlFor="url" className="block text-xs font-bold text-[#15131C] dark:text-content mb-1.5 font-satoshi">
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
                  className="flex-1 py-3 border border-[#E2E1EA] dark:border-line text-[#6B6478] dark:text-content-muted rounded-xl font-satoshi font-bold text-sm hover:border-[#B9B9C6] dark:hover:border-content-subtle transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-brand-gradient text-white rounded-xl font-satoshi font-bold text-sm shadow-[0_10px_24px_-6px_rgba(74,55,216,0.45)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-transform"
                >
                  {submitting ? 'Saving…' : editingLink ? 'Update' : 'Add link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
