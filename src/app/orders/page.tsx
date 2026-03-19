import { auth } from '@/lib/auth'
import { getOrders } from '@/actions/order'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { getMessage } from '@/lib/messages'
import type { OrderWithItems } from '@/types/database'

export default async function OrdersPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  const orders: OrderWithItems[] = await getOrders(session.user.id)

  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pendente' },
    CONFIRMED: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Confirmado' },
    PREPARING: { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'Preparando' },
    READY: { icon: CheckCircle, color: 'text-purple-600 bg-purple-100', label: 'Pronto' },
    SHIPPED: { icon: Package, color: 'text-indigo-600 bg-indigo-100', label: 'Enviado' },
    COMPLETED: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Concluído' },
    CANCELLED: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Cancelado' },
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{getMessage('profile.my_orders')}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg mb-6">{getMessage('empty_states.no_orders')}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Ver produtos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || { icon: Clock, color: 'text-gray-600 bg-gray-100', label: order.status }
            const StatusIcon = status.icon

            return (
              <div key={order.id} className="bg-card rounded-xl border overflow-hidden">
                <div className="p-4 border-b bg-muted/30 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="font-medium text-sm">{status.label}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Img</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <p className="font-semibold">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t bg-muted/30 flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {order.items.length} item(ns)
                  </span>
                  <div className="text-right">
                    <span className="text-muted-foreground text-sm">Total: </span>
                    <span className="text-xl font-bold text-primary">
                      R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
