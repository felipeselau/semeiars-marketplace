import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPayoutHistory } from '@/actions/payment'
import { PayoutHistoryClient } from './PayoutHistoryClient'

export default async function PayoutsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SELLER') {
    redirect('/')
  }

  const payouts = await getPayoutHistory(session.user.id)

  return (
    <PayoutHistoryClient 
      initialPayouts={payouts.map(p => ({
        ...p,
        createdAt: p.createdAt,
        processedAt: p.processedAt,
      }))} 
    />
  )
}
