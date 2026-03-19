'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkPaymentStatus } from '@/actions/payment'
import { QrCode, Copy, CheckCircle, Loader2, Timer } from 'lucide-react'

interface PaymentWaitingClientProps {
  paymentId: string
  pixQrCode: string
  pixCopyPaste: string
  amount: number
}

export function PaymentWaitingClient({ 
  paymentId, 
  pixQrCode, 
  pixCopyPaste,
  amount 
}: PaymentWaitingClientProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'failed'>('waiting')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    const interval = setInterval(async () => {
      setLoading(true)
      const result = await checkPaymentStatus(paymentId)
      setLoading(false)

      if (result.success) {
        if (result.status === 'CONFIRMED') {
          setStatus('confirmed')
          setTimeout(() => {
            router.push('/orders')
          }, 2000)
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [paymentId, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function copyToClipboard() {
    navigator.clipboard.writeText(pixCopyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'confirmed') {
    return (
      <div className="text-center py-16">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-green-600 mb-2">Pagamento Confirmado!</h1>
        <p className="text-muted-foreground">Redirecionando para seus pedidos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-2">Pague com PIX</h1>
      <p className="text-center text-muted-foreground mb-6">
        Valor: <span className="font-bold text-lg">R$ {amount.toFixed(2).replace('.', ',')}</span>
      </p>

      <div className="bg-card rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">QR Code expira em</span>
          <span className="flex items-center gap-2 font-medium">
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg mb-4">
          {pixQrCode ? (
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixQrCode)}`}
              alt="QR Code PIX"
              className="w-48 h-48 mx-auto"
            />
          ) : (
            <div className="w-48 h-48 mx-auto bg-muted flex items-center justify-center">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">Ou copie o código:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={pixCopyPaste.slice(0, 50) + '...'}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm">
            {loading ? 'Verificando pagamento...' : 'Aguardando pagamento...'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          O pagamento será confirmado automaticamente em alguns segundos
        </p>
      </div>

      <button
        onClick={() => router.push('/cart')}
        className="w-full mt-6 py-3 text-primary hover:underline"
      >
        Cancelar e voltar ao carrinho
      </button>
    </div>
  )
}
