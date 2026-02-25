'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/actions/product'

export function NewProductForm({ categories, userId }: { categories: any[]; userId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const result = await createProduct(userId, formData)

    setSaving(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/products')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Product Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="basePrice" className="block text-sm font-medium mb-1">
              Base Price *
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="currentPrice" className="block text-sm font-medium mb-1">
              Current Price
            </label>
            <input
              id="currentPrice"
              name="currentPrice"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to use base price
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-1">
              Quantity *
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
            Image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter a URL for your product image
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-6 py-2 rounded-md hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
