'use client'

import { useState } from 'react'
import { updateProfile } from '@/actions/auth'
import Link from 'next/link'
import { Package, Edit, User as UserIcon, Plus } from 'lucide-react'
import { getMessage } from '@/lib/messages'

import type { Session } from 'next-auth'
import type { ProductWithCategory } from '@/types/database'

export function ProfileClient({
  session: initialSession,
  products,
}: {
  session: Session
  products: ProductWithCategory[]
}) {
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
      setSuccess(getMessage('messages.success_generic'))
      setIsEditing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{getMessage('profile.title')}</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas informações e produtos</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <Edit className="w-4 h-4" />
          {isEditing ? 'Cancelar' : getMessage('profile.edit_profile')}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">{error}</div>
      )}

      {success && <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">{success}</div>}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-semibold text-lg">Informações Pessoais</h2>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nome
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={session?.user?.name}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={session?.user?.email}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-2">
                    Endereço
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-2">
                    Função
                  </label>
                  <select
                    id="role"
                    name="role"
                    defaultValue={session?.user?.role}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="BUYER">Comprador</option>
                    <option value="SELLER">Vendedor</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Mude para Vendedor para começar a vender produtos
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border px-6 py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{session?.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{session?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Função</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${session?.user?.role === 'SELLER' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                  >
                    {session?.user?.role === 'SELLER' ? 'Vendedor' : 'Comprador'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {session?.user?.role === 'SELLER' && (
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg">{getMessage('profile.my_products')}</h2>
                </div>
                <Link
                  href="/products/new"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Novo
                </Link>
              </div>

              {userProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {getMessage('empty_states.no_sales')}
                </p>
              ) : (
                <div className="space-y-3">
                  {userProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="block p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {product.currentPrice.toFixed(2).replace('.', ',')} - {product.quantity}{' '}
                        un
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {session?.user?.role === 'BUYER' && (
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-4">{getMessage('profile.become_seller')}</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Torne-se vendedor para começar a comercializar seus produtos
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                Atualizar função →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
