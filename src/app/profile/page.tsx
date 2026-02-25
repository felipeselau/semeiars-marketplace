import { auth } from '@/lib/auth'
import { getProductsBySeller } from '@/actions/product'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  let products: any[] = []
  if (session.user.role === 'SELLER') {
    products = await getProductsBySeller(session.user.id)
  }

  return <ProfileClient session={session} products={products} />
}
