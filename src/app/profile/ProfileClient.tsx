'use client'

import { useState } from 'react'
import { updateProfile } from '@/actions/auth'
import Link from 'next/link'
import { Package, Edit, User as UserIcon } from 'lucide-react'

export function ProfileClient({ session: initialSession, products }: { session: any; products: any[] }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [session] = useState(initialSession)
  const [userProducts] = useState(products)
  const [isEditing, setIsEditing] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(session.user.id, formData)

    setSaving(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <Edit className="w-4 h-4" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Personal Information</h2>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={session?.user?.name}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={session?.user?.email}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    defaultValue={session?.user?.role}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="BUYER">Buyer</option>
                    <option value="SELLER">Seller</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Switch to Seller to start selling products
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{session?.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{session?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{session?.user?.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {session?.user?.role === 'SELLER' && (
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-semibold">My Products</h2>
                </div>
                <Link
                  href="/products/new"
                  className="text-sm text-primary hover:underline"
                >
                  + Add New
                </Link>
              </div>

              {userProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  You haven&apos;t listed any products yet
                </p>
              ) : (
                <div className="space-y-3">
                  {userProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="block p-3 border rounded hover:bg-accent"
                    >
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${product.currentPrice.toFixed(2)} - {product.quantity} in stock
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {session?.user?.role === 'BUYER' && (
            <div className="border rounded-lg p-6">
              <h2 className="font-semibold mb-4">Become a Seller</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Switch to Seller role to start listing products for sale
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary hover:underline text-sm"
              >
                Update Role →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
