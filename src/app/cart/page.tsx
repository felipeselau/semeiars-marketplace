import { auth } from '@/lib/auth'
import { getCart } from '@/actions/cart'
import { redirect } from 'next/navigation'
import { CartClient } from './CartClient'

export default async function CartPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const cart = await getCart(session.user.id)

  return <CartClient cart={cart} />
}
