import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Inbox } from 'lucide-react'
import { getMessage } from '@/lib/messages'
import { getSellerOrders, getSellerOrderCounts } from '@/actions/order'

type Props = {
  searchParams: Promise<{ status?: string }>
}

const statusTabs = [
  { key: 'all', label: 'seller_orders.all' },
  { key: 'PENDING', label: 'status.pending' },
  { key: 'CONFIRMED', label: 'status.confirmed' },
  { key: 'PREPARING', label: 'status.preparing' },
  { key: 'READY', label: 'status.ready' },
  { key: 'COMPLETED', label: 'status.completed' },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  PENDING: { color: 'text-yellow-600', bg: 'bg-yellow-100' },
  CONFIRMED: { color: 'text-blue-600', bg: 'bg-blue-100' },
  PREPARING: { color: 'text-orange-600', bg: 'bg-orange-100' },
  READY: { color: 'text-green-600', bg: 'bg-green-100' },
  SHIPPED: { color: 'text-purple-600', bg: 'bg-purple-100' },
  COMPLETED: { color: 'text-gray-600', bg: 'bg-gray-100' },
  CANCELLED: { color: 'text-red-600', bg: 'bg-red-100' },
}

export default async function SellerOrdersPage({ searchParams }: Props) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'SELLER') {
    redirect('/profile')
  }

  const params = await searchParams
  const statusFilter = params.status || 'all'

  const [orders, counts] = await Promise.all([
    getSellerOrders(session.user.id, statusFilter),
    getSellerOrderCounts(session.user.id),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{getMessage('seller_orders.title')}</h1>
        <p className="text-muted-foreground">Gerencie os pedidos dos seus produtos</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {statusTabs.map((tab) => {
          const count = tab.key === 'all' ? counts.all : counts[tab.key as keyof typeof counts]
          const isActive = statusFilter === tab.key

          return (
            <Link
              key={tab.key}
              href={`/seller/orders?status=${tab.key}`}
              className={`p-4 rounded-xl border transition-all ${
                isActive ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className={`text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {getMessage(tab.label)}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.key

          return (
            <Link
              key={tab.key}
              href={`/seller/orders?status=${tab.key}`}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {getMessage(tab.label)} (
              {tab.key === 'all' ? counts.all : counts[tab.key as keyof typeof counts]})
            </Link>
          )
        })}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Inbox className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg mb-2">Nenhum pedido encontrado</p>
          <p className="text-sm text-muted-foreground">
            {statusFilter === 'all'
              ? 'Você ainda não recebeu nenhum pedido'
              : `Não há pedidos com status "${getMessage(`status.${statusFilter.toLowerCase()}`)}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((sellerOrder) => {
            const status = statusConfig[sellerOrder.status]
            const orderTotal = sellerOrder.order.items
              .filter((item) => item.product.sellerId === session.user.id)
              .reduce((sum, item) => sum + item.price * item.quantity, 0)

            return (
              <Link
                key={sellerOrder.id}
                href={`/seller/orders/${sellerOrder.orderId}`}
                className="block bg-card rounded-xl border p-4 hover:shadow-md transition-all hover:border-primary/30"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg">
                        #{sellerOrder.orderId.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                      >
                        {getMessage(`status.${sellerOrder.status.toLowerCase()}`)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">
                      Cliente: {sellerOrder.order.buyer.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(sellerOrder.order.createdAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      R$ {orderTotal.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {
                        sellerOrder.order.items.filter(
                          (item) => item.product.sellerId === session.user.id
                        ).length
                      }{' '}
                      item(s)
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
