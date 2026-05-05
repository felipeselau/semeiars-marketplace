'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initiateCheckout } from '@/actions/checkout'
import { createPixPayment, checkPaymentStatus } from '@/actions/payment'
import { getMessage } from '@/lib/messages'
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import type { CartWithItems } from '@/types/database'

interface CheckoutClientProps {
  cart: CartWithItems
  userId: string
  userEmail: string
  userName: string
}

export function CheckoutClient({ cart, userId, userEmail, userName }: CheckoutClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<'review' | 'processing' | 'success'>('review')
  const [error, setError] = useState<string | null>(null)
  const [customerDocument, setCustomerDocument] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)

  const total =
    cart?.items.reduce((sum, item) => sum + item.product.currentPrice * item.quantity, 0) || 0

  useEffect(() => {
    if (step === 'success' && orderId) {
      router.push('/orders')
    }
  }, [step, orderId, router])

  async function handleInitiateCheckout() {
    setError(null)
    setStep('processing')

    const result = await initiateCheckout(userId)

    if (result.error) {
      setError(result.error)
      setStep('review')
      return
    }

    setOrderId(result.orderId!)

    const paymentResult = await createPixPayment(userId, {
      orderId: result.orderId!,
      customerName: userName,
      customerEmail: userEmail,
      customerDocument: customerDocument.replace(/\D/g, ''),
    })

    if (paymentResult.error) {
      setError(paymentResult.error)
      setStep('review')
      return
    }

    const isMock = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true'

    if (isMock) {
      await checkPaymentStatus(paymentResult.paymentId!)
    }

    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="text-center py-16">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-green-600 mb-2">Pedido Realizado com Sucesso!</h1>
        <p className="text-muted-foreground">Redirecionando para seus pedidos...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{getMessage('checkout.title')}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">{getMessage('checkout.review')}</h2>

            {cart?.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.product.seller.name}</p>
                  <p className="text-sm">
                    Qtd: {item.quantity} x R${' '}
                    {item.product.currentPrice.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="font-medium">
                  R$ {(item.product.currentPrice * item.quantity).toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Dados para Pagamento</h2>
            <div>
              <label className="block text-sm font-medium mb-2">CPF do comprador</label>
              <input
                type="text"
                value={customerDocument}
                onChange={(e) => setCustomerDocument(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Necessário para emissão de nota fiscal
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">
              {getMessage('cart.summary') || 'Resumo do Pedido'}
            </h2>

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

            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Método de pagamento</p>
              <p className="text-sm text-muted-foreground">PIX (instantâneo)</p>
              {process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true' && (
                <p className="text-xs text-blue-600 mt-1">Modo teste ativo</p>
              )}
            </div>

            <button
              onClick={handleInitiateCheckout}
              disabled={step === 'processing' || !customerDocument}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {step === 'processing' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>Pagar com PIX</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
