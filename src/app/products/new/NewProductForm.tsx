'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/actions/product'
import { Package, ArrowLeft } from 'lucide-react'

import type { Category } from '@/types/database'

export function NewProductForm({ categories, userId }: { categories: Category[]; userId: string }) {
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
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criar Novo Produto</h1>
        <p className="text-muted-foreground">Anuncie seus produtos no marketplace</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Informações do Produto</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome do Produto *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ex: Arroz Integral Orgânico"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Descreva seu produto..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium mb-2">
              Categoria
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
              URL da Imagem
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cole o link de uma imagem do seu produto
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Precificação e Estoque</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium mb-2">
                Preço Base (R$) *
              </label>
              <input
                id="basePrice"
                name="basePrice"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="currentPrice" className="block text-sm font-medium mb-2">
                Preço Promocional
              </label>
              <input
                id="currentPrice"
                name="currentPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Deixe vazio para usar o preço base"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-2">
              Quantidade em Estoque *
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              required
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            <Package className="w-5 h-5" />
            {saving ? 'Criando...' : 'Criar Produto'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-8 py-3 rounded-lg hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
