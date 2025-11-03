'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiImage } from 'react-icons/fi'

interface Product {
  id: string
  name: string
  description: string | null
  front_image_url: string
  back_image_url: string
  price: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    front_image_url: '',
    back_image_url: '',
    price: '',
    is_active: true,
    sort_order: 0
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle image upload via API
  const handleImageUpload = async (file: File, field: 'front_image_url' | 'back_image_url') => {
    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      const { publicUrl } = await response.json()
      setFormData(prev => ({ ...prev, [field]: publicUrl }))
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      description: formData.description || null,
      front_image_url: formData.front_image_url,
      back_image_url: formData.back_image_url,
      price: parseInt(formData.price),
      is_active: formData.is_active,
      sort_order: formData.sort_order
    }

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products'

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        await fetchProducts()
        closeModal()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  // Toggle active status
  const toggleActive = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !product.is_active })
      })

      if (response.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Error toggling product status:', error)
    }
  }

  // Open modal for create/edit
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        front_image_url: product.front_image_url,
        back_image_url: product.back_image_url,
        price: product.price.toString(),
        is_active: product.is_active,
        sort_order: product.sort_order
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        front_image_url: '',
        back_image_url: '',
        price: '',
        is_active: true,
        sort_order: products.length
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setUploadError('')
  }

  if (loading) {
    return <div className="p-6">Loading products...</div>
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage NFC card designs and pricing</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 cursor-pointer"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Product Images */}
            <div className="relative h-48 bg-gray-100">
              <Image
                src={product.front_image_url}
                alt={`${product.name} - Front`}
                fill
                className="object-cover"
              />
              {!product.is_active && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold">INACTIVE</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-purple-600">
                  ₦{(product.price / 100).toLocaleString()}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  product.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(product)}
                  className="flex-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center gap-1 cursor-pointer"
                  title={product.is_active ? 'Deactivate' : 'Activate'}
                >
                  {product.is_active ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
                <button
                  onClick={() => openModal(product)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FiEdit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FiTrash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <FiImage className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products yet</h3>
          <p className="mt-2 text-gray-600">Get started by adding your first NFC card design</p>
          <button
            onClick={() => openModal()}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 cursor-pointer"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Web3 Card"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Brief description of the card design"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-1">Price (in Kobo) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 500000 (₦5,000)"
                  />
                  {formData.price && (
                    <p className="text-sm text-gray-600 mt-1">
                      = ₦{(parseInt(formData.price) / 100).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Front Image */}
                <div>
                  <label className="block text-sm font-medium mb-1">Front Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'front_image_url')}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={uploading}
                  />
                  {/* {formData.front_image_url && (
                    <div className="relative mt-2 h-32 rounded overflow-hidden">
                      <Image src={formData.front_image_url} alt="Front preview" fill className="object-cover" />
                    </div>
                  )} */}

                  {formData.front_image_url && (
                    <div className="relative mt-2 overflow-hidden">
                      {/* <Image src={formData.front_image_url} alt="Front preview" className="object-contain object-left w-full h-auto" /> */}
                      <img src={formData.front_image_url} alt="Front preview" className="object-contain object-left w-auto h-80 rounded" />
                    </div>
                  )}
                </div>

                {/* Back Image */}
                <div>
                  <label className="block text-sm font-medium mb-1">Back Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'back_image_url')}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={uploading}
                  />
                  {/* {formData.back_image_url && (
                    <div className="relative mt-2 h-32 rounded overflow-hidden">
                      <Image src={formData.back_image_url} alt="Back preview" fill className="object-cover" />
                    </div>
                  )} */}
                  {formData.back_image_url && (
                    <div className="relative mt-2 overflow-hidden">
                      <img src={formData.back_image_url} alt="Back preview" className="object-contain object-left w-auto h-80 rounded" />
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-red-600 text-sm">{uploadError}</p>
                )}

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-purple-600"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">Active (visible in store)</label>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                  >
                    {uploading ? 'Uploading...' : (editingProduct ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
