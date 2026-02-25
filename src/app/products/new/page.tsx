import { auth } from '@/lib/auth'
import { getCategories } from '@/actions/category'
import { redirect } from 'next/navigation'
import { NewProductForm } from './NewProductForm'

export default async function NewProductPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'SELLER') {
    redirect('/profile')
  }

  const categories = await getCategories()

  return <NewProductForm categories={categories} userId={session.user.id} />
}
