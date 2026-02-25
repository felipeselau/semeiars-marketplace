'use client'

import { useState } from 'react'
import { addToCart } from '@/actions/cart'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus } from 'lucide-react'

export function AddToCartButton({ productId, session }: { productId: string; session: any }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  async function handleAddToCart() {
    setAdding(true)
    
    if (!session) {
      router.push('/login')
      return
    }

    await addToCart(session.user.id, productId, quantity)
    setAdding(false)
    setMessage('Added to cart!')
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Quantity:</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 border rounded hover:bg-accent"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 border rounded hover:bg-accent"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={adding}
        className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-5 h-5" />
        {adding ? 'Adding...' : 'Add to Cart'}
      </button>

      {message && (
        <p className="text-green-600 text-center">{message}</p>
      )}
    </div>
  )
}
