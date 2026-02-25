'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCartItemQuantity, removeFromCart } from '@/actions/cart'
import { createOrder } from '@/actions/order'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'

export function CartClient({ cart, userId }: { cart: any; userId: string }) {
  const router = useRouter()
  const [cartData, setCartData] = useState(cart)
  const [checkingOut, setCheckingOut] = useState(false)

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    await updateCartItemQuantity(itemId, quantity)
    const newItems = cartData.items.map((item: any) => {
      if (item.id === itemId) {
        return { ...item, quantity }
      }
      return item
    }).filter((item: any) => item.quantity > 0)
    setCartData({ ...cartData, items: newItems })
  }

  async function handleRemoveItem(itemId: string) {
    await removeFromCart(itemId)
    setCartData({
      ...cartData,
      items: cartData.items.filter((item: any) => item.id !== itemId)
    })
  }

  async function handleCheckout() {
    setCheckingOut(true)
    const items = cartData.items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.currentPrice,
    }))

    const result = await createOrder(userId, items)
    
    if (result.success) {
      router.push('/orders')
    }
    setCheckingOut(false)
  }

  const total = cartData?.items.reduce(
    (sum: number, item: any) => sum + item.product.currentPrice * item.quantity,
    0
  ) || 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      {!cartData || cartData.items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartData.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No Image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Seller: {item.product.seller.name}
                  </p>
                  <p className="text-primary font-bold mt-1">
                    ${item.product.currentPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 border rounded hover:bg-accent"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 border rounded hover:bg-accent"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-semibold">
                    ${(item.product.currentPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartData.items.length} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {checkingOut ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
