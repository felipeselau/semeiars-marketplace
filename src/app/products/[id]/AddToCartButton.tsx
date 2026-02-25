'use client'

import { useState } from 'react'
import { addToCart } from '@/actions/cart'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react'
import { getMessage } from '@/lib/messages'

import type { Session } from 'next-auth'

export function AddToCartButton({ productId, session }: { productId: string; session: Session | null }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleAddToCart() {
    setAdding(true)
    
    if (!session) {
      router.push('/login')
      return
    }

    await addToCart(session.user.id, productId, quantity)
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Quantidade:</label>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-background rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 hover:bg-background rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={adding || added}
        className={`w-full py-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
          added 
            ? 'bg-green-600 text-white' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
        }`}
      >
        {added ? (
          <>
            <Check className="w-5 h-5" />
            Adicionado!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            {adding ? 'Adicionando...' : getMessage('product.add_to_cart')}
          </>
        )}
      </button>
    </div>
  )
}
