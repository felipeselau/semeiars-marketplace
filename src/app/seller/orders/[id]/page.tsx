'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, User, Calendar, FileText, Check, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { getMessage } from '@/lib/messages'
import { updateSellerOrderStatus, updateSellerOrderNote, updatePickupInstructions } from '@/actions/order'
import type { OrderStatus } from '@prisma/client'

type Props = {
  params: Promise<{ id: string }>
}

const statusFlow: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  PENDING: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
  CONFIRMED: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Check },
  PREPARING: { color: 'text-orange-600', bg: 'bg-orange-100', icon: Package },
  READY: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
  SHIPPED: { color: 'text-purple-600', bg: 'bg-purple-100', icon: Truck },
  COMPLETED: { color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle },
  CANCELLED: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
}

interface SellerOrderData {
  id: string
  orderId: string
  status: OrderStatus
  note: string | null
  estimatedPickupDate: string | null
  pickupInstructions: string | null
  createdAt: string
  order: {
    id: string
    totalAmount: number
    createdAt: string
    buyer: {
      id: string
      name: string
      email: string
      phone: string | null
      address: string | null
    }
    items: Array<{
      id: string
      quantity: number
      price: number
      product: {
        id: string
        name: string
        imageUrl: string | null
        sellerId: string
      }
    }>
  }
}

export default function SellerOrderDetailPage({ params }: Props) {
  const router = useRouter()
  const [orderData, setOrderData] = useState<SellerOrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')
  const [pickupInstructions, setPickupInstructions] = useState('')
  const [estimatedPickupDate, setEstimatedPickupDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { id } = await params
      const response = await fetch(`/api/seller/orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setOrderData(data)
        setNote(data.note || '')
        setPickupInstructions(data.pickupInstructions || '')
        setEstimatedPickupDate(data.estimatedPickupDate ? data.estimatedPickupDate.split('T')[0] : '')
        setSelectedStatus(data.status)
      }
      setLoading(false)
    }
    fetchData()
  }, [params])

  async function handleStatusUpdate(newStatus: OrderStatus) {
    setSaving(true)
    if (!orderData) return

    const result = await updateSellerOrderStatus(orderData.id, newStatus, estimatedPickupDate)
    
    if (result.success) {
      setSelectedStatus(newStatus)
      setSuccessMessage('Status atualizado!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
    setSaving(false)
  }

  async function handleNoteUpdate() {
    setSaving(true)
    if (!orderData) return

    const result = await updateSellerOrderNote(orderData.id, note)
    
    if (result.success) {
      setSuccessMessage('Nota salva!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
    setSaving(false)
  }

  async function handleInstructionsUpdate() {
    setSaving(true)
    if (!orderData) return

    const result = await updatePickupInstructions(orderData.id, pickupInstructions)
    
    if (result.success) {
      setSuccessMessage('Instruções salvas!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Pedido não encontrado</p>
        <Link href="/seller/orders" className="text-primary hover:underline mt-2 inline-block">
          Voltar para pedidos
        </Link>
      </div>
    )
  }

  const currentStatus = statusConfig[orderData.status]
  const StatusIcon = currentStatus?.icon || Clock

  // Calculate total for this seller's items
  const sellerItems = orderData.order.items.filter(
    (item) => item.product.sellerId === orderData.id
  )
  const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Get next status options
  const currentIndex = statusFlow.indexOf(orderData.status)
  const nextStatuses = statusFlow.slice(currentIndex + 1)

  return (
    <div>
      <Link
        href="/seller/orders"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para pedidos
      </Link>

      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold">
                  Pedido #{orderData.orderId.slice(-8).toUpperCase()}
                </h1>
                <p className="text-muted-foreground">
                  {new Date(orderData.order.createdAt).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStatus.bg}`}>
                <StatusIcon className={`w-5 h-5 ${currentStatus.color}`} />
                <span className={`font-medium ${currentStatus.color}`}>
                  {getMessage(`status.${orderData.status.toLowerCase()}`)}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="flex items-center justify-between mt-6 overflow-x-auto pb-2">
              {statusFlow.map((status, index) => {
                const isCompleted = index <= currentIndex
                const isCurrent = status === orderData.status
                const config = statusConfig[status]

                return (
                  <div key={status} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <config.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs mt-1 whitespace-nowrap ${isCurrent ? 'font-medium' : 'text-muted-foreground'}`}>
                        {getMessage(`status.${status.toLowerCase()}`)}
                      </span>
                    </div>
                    {index < statusFlow.length - 1 && (
                      <div
                        className={`w-8 sm:w-16 h-0.5 mx-1 ${
                          index < currentIndex ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Update Status */}
          {orderData.status !== 'COMPLETED' && orderData.status !== 'CANCELLED' && (
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-4">Atualizar Status</h2>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {status === 'READY' && 'Marcar como Pronto'}
                    {status === 'COMPLETED' && 'Concluir Pedido'}
                    {status === 'PREPARING' && 'Iniciar Preparação'}
                    {status === 'CONFIRMED' && 'Confirmar Pedido'}
                    {status === 'SHIPPED' && 'Marcar como Enviado'}
                  </button>
                ))}
                {['COMPLETED', 'CANCELLED'].indexOf(orderData.status) === -1 && (
                  <button
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    disabled={saving}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-lg mb-4">Produtos deste Pedido</h2>
            <div className="space-y-4">
              {sellerItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
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
            <div className="border-t mt-4 pt-4 flex justify-between items-center">
              <span className="font-medium">Total deste pedido</span>
              <span className="text-xl font-bold text-primary">
                R$ {sellerTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Buyer Info */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">{getMessage('seller_orders.buyer_info')}</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{orderData.order.buyer.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{orderData.order.buyer.email}</p>
              </div>
              {orderData.order.buyer.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{orderData.order.buyer.phone}</p>
                </div>
              )}
              {orderData.order.buyer.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{orderData.order.buyer.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Pickup Date */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">{getMessage('seller_orders.estimated_pickup')}</h2>
            </div>
            <input
              type="date"
              value={estimatedPickupDate}
              onChange={(e) => setEstimatedPickupDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={() => handleStatusUpdate(selectedStatus)}
              disabled={saving || !estimatedPickupDate}
              className="w-full mt-2 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Data'}
            </button>
          </div>

          {/* Pickup Instructions */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">{getMessage('seller_orders.pickup_instructions')}</h2>
            </div>
            <textarea
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="Ex: Retire na portaria principal das 8h às 18h..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg resize-none"
            />
            <button
              onClick={handleInstructionsUpdate}
              disabled={saving}
              className="w-full mt-2 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Instruções'}
            </button>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">{getMessage('seller_orders.add_note')}</h2>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Adicione uma nota interna..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg resize-none"
            />
            <button
              onClick={handleNoteUpdate}
              disabled={saving}
              className="w-full mt-2 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Nota'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
