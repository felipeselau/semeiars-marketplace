import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateWebhookSignature } from '@/lib/pagseguro'
import { PayoutStatus, PaymentSplitStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-pagseguro-signature')
    const body = await request.text()

    if (!signature) {
      console.error('[Webhook] Missing PagSeguro signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const isValid = validateWebhookSignature(body, signature)

    if (!isValid && process.env.MOCK_PAYMENTS !== 'true') {
      console.error('[Webhook] Invalid PagSeguro signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    console.log('[Webhook] PagSeguro payload:', payload)

    const { id: payoutId, status, errorMessage } = payload

    if (!payoutId || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const payout = await prisma.payout.findFirst({
      where: { pagseguroId: payoutId },
    })

    if (!payout) {
      console.error('[Webhook] Payout not found for ID:', payoutId)
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    let newPayoutStatus: PayoutStatus | null = null
    let newSplitStatus: PaymentSplitStatus | null = null

    if (status === 'SUCCESS' || status === 'COMPLETED') {
      newPayoutStatus = PayoutStatus.SUCCESS
      newSplitStatus = PaymentSplitStatus.SUCCESS
    } else if (status === 'PROCESSING' || status === 'PENDING') {
      newPayoutStatus = PayoutStatus.PROCESSING
      newSplitStatus = PaymentSplitStatus.PROCESSING
    } else if (status === 'FAILED' || status === 'CANCELED' || status === 'REVERSED') {
      newPayoutStatus = PayoutStatus.FAILED
      newSplitStatus = PaymentSplitStatus.FAILED
    }

    if (newPayoutStatus) {
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: newPayoutStatus,
          errorMessage: errorMessage || null,
          processedAt: newPayoutStatus === PayoutStatus.SUCCESS ? new Date() : null,
        },
      })

      await prisma.paymentSplit.update({
        where: { id: payout.paymentSplitId },
        data: {
          payoutStatus: newSplitStatus,
          paidAt: newSplitStatus === PaymentSplitStatus.SUCCESS ? new Date() : null,
        },
      })

      console.log(`[Webhook] Payout ${payout.id} updated to ${newPayoutStatus}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Webhook] Error processing PagSeguro webhook:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'PagSeguro webhook endpoint' })
}
