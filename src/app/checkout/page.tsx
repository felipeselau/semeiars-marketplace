import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CheckoutClient } from './CheckoutClient'

export default async function CheckoutPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              seller: true,
            },
          },
        },
      },
    },
  })

  if (!cart || cart.items.length === 0) {
    redirect('/cart')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  })

  return (
    <CheckoutClient
      cart={cart}
      userId={session.user.id}
      userEmail={user?.email || ''}
      userName={user?.name || ''}
    />
  )
}
