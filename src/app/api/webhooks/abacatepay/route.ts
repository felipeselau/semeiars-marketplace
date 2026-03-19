import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateWebhookSignature } from '@/lib/abacatepay'
import { processPaymentSplit } from '@/actions/payment'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-abacate-signature')
    const body = await request.text()

    if (!signature) {
      console.error('[Webhook] Missing signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const isValid = validateWebhookSignature(body, signature)
    
    if (!isValid && process.env.MOCK_PAYMENTS !== 'true') {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    console.log('[Webhook] AbacatePay payload:', payload)

    const { id: chargeId, status, paidAt } = payload

    if (!chargeId || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: { abacatePayId: chargeId },
      include: { order: true },
    })

    if (!payment) {
      console.error('[Webhook] Payment not found for charge:', chargeId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    let newPaymentStatus: PaymentStatus | null = null

    if (status === 'CONFIRMED' || status === 'PAID') {
      newPaymentStatus = PaymentStatus.CONFIRMED
    } else if (status === 'FAILED' || status === 'CANCELED' || status === 'EXPIRED') {
      newPaymentStatus = PaymentStatus.FAILED
    }

    if (newPaymentStatus && newPaymentStatus !== payment.status) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          paidAt: newPaymentStatus === PaymentStatus.CONFIRMED ? new Date(paidAt) : null,
        },
      })

      if (newPaymentStatus === PaymentStatus.CONFIRMED) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CONFIRMED },
        })

        await processPaymentSplit(payment.id)
      } else if (newPaymentStatus === PaymentStatus.FAILED) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CANCELLED },
        })
      }

      console.log(`[Webhook] Payment ${payment.id} updated to ${newPaymentStatus}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Error processing AbacatePay webhook:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'AbacatePay webhook endpoint' })
}
