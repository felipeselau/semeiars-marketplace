'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateCartItemQuantity, removeFromCart } from '@/actions/cart'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { getMessage } from '@/lib/messages'

import type { CartWithItems, CartItemWithProduct } from '@/types/database'

export function CartClient({ cart }: { cart: CartWithItems }) {
  const router = useRouter()
  const [cartData, setCartData] = useState(cart)

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    await updateCartItemQuantity(itemId, quantity)
    const newItems = cartData.items
      .map((item: CartItemWithProduct) => {
        if (item.id === itemId) {
          return { ...item, quantity }
        }
        return item
      })
      .filter((item: CartItemWithProduct) => item.quantity > 0)
    setCartData({ ...cartData, items: newItems })
  }

  async function handleRemoveItem(itemId: string) {
    await removeFromCart(itemId)
    setCartData({
      ...cartData,
      items: cartData.items.filter((item: CartItemWithProduct) => item.id !== itemId),
    })
  }

  async function handleCheckout() {
    router.push('/checkout')
  }

  const total =
    cartData?.items.reduce(
      (sum: number, item: CartItemWithProduct) => sum + item.product.currentPrice * item.quantity,
      0
    ) || 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{getMessage('cart.title')}</h1>

      {!cartData || cartData.items.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg mb-6">{getMessage('cart.empty')}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Ver produtos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartData.items.map((item: CartItemWithProduct) => (
              <div key={item.id} className="flex gap-4 p-4 bg-card rounded-xl border">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Sem Imagem</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.product.seller.name}
                  </p>
                  <p className="text-primary font-bold mt-2">
                    R$ {item.product.currentPrice.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title={getMessage('cart.remove')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-background rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-background rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold">
                    R$ {(item.product.currentPrice * item.quantity).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">{getMessage('checkout.title')}</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{getMessage('cart.subtotal')}</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span>A combinar</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>{getMessage('cart.total')}</span>
                  <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {getMessage('cart.checkout')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
