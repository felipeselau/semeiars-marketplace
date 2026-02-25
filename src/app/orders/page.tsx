import { auth } from '@/lib/auth'
import { getOrders } from '@/actions/order'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function OrdersPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  const orders = await getOrders(session.user.id)

  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-yellow-600', label: 'Pending' },
    CONFIRMED: { icon: CheckCircle, color: 'text-green-600', label: 'Confirmed' },
    CANCELLED: { icon: XCircle, color: 'text-red-600', label: 'Cancelled' },
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet</p>
          <Link
            href="/products"
            className="text-primary hover:underline"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => {
            const status = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = status.icon

            return (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="font-medium">{status.label}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {order.items.length} item(s)
                  </span>
                  <span className="text-lg font-bold">
                    Total: ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
