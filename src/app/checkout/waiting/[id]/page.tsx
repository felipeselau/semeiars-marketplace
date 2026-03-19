import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PaymentWaitingClient } from '../PaymentWaitingClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CheckoutWaitingPage({ params }: Props) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  const { id: paymentId } = await params

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: true,
    },
  })

  if (!payment || payment.buyerId !== session.user.id) {
    redirect('/cart')
  }

  return (
    <PaymentWaitingClient
      paymentId={payment.id}
      pixQrCode={payment.pixQrCode || ''}
      pixCopyPaste={payment.pixCopyPaste || ''}
      amount={payment.amount}
    />
  )
}
