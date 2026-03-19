import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSellerBalance, getPayoutHistory } from '@/actions/payment'
import { getMessage } from '@/lib/messages'
import { Clock, CheckCircle, TrendingUp } from 'lucide-react'

export default async function SellerBalancePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SELLER') {
    redirect('/')
  }

  const balance = await getSellerBalance(session.user.id)
  const payouts = await getPayoutHistory(session.user.id, 5)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{getMessage('seller.balance.title')}</h1>
      <p className="text-muted-foreground mb-8">
        Acompanhe suas finanças e recebimentos
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground">Disponível</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            R$ {balance.available.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-muted-foreground">Pendente</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            R$ {balance.pending.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground">Total Recebido</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            R$ {balance.totalPaid.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">{getMessage('seller.balance.recentTransactions')}</h2>
        
        {payouts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma transação ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div 
                key={payout.id} 
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    R$ {payout.amount.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payout.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    payout.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                    payout.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    payout.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {payout.status === 'SUCCESS' ? 'Recebido' :
                     payout.status === 'PROCESSING' ? 'Processando' :
                     payout.status === 'FAILED' ? 'Falhou' :
                     'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {payouts.length > 0 && (
          <a
            href="/seller/payouts"
            className="block mt-4 text-center text-primary hover:underline"
          >
            Ver histórico completo
          </a>
        )}
      </div>
    </div>
  )
}
