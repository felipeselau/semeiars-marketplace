'use client'

import { useState } from 'react'
import { retryPayout } from '@/actions/payment'
import { getMessage } from '@/lib/messages'
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface Payout {
  id: string
  amount: number
  status: string
  createdAt: Date
  processedAt: Date | null
  errorMessage: string | null
}

export function PayoutHistoryClient({ initialPayouts }: { initialPayouts: Payout[] }) {
  const payouts = initialPayouts
  const [retrying, setRetrying] = useState<string | null>(null)

  async function handleRetry(payoutId: string) {
    setRetrying(payoutId)
    await retryPayout(payoutId)
    setRetrying(null)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{getMessage('seller.payouts.title')}</h1>

      {payouts.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="text-muted-foreground">Nenhum repasse realizado ainda.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium">Data</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Valor</th>
                <th className="text-left px-6 py-3 text-sm font-medium">Status</th>
                <th className="text-right px-6 py-3 text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="px-6 py-4">
                    {new Date(payout.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    R$ {payout.amount.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      payout.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                      payout.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      payout.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payout.status === 'SUCCESS' && <CheckCircle className="w-3.5 h-3.5" />}
                      {payout.status === 'PROCESSING' && <Clock className="w-3.5 h-3.5" />}
                      {payout.status === 'FAILED' && <XCircle className="w-3.5 h-3.5" />}
                      {payout.status === 'PENDING' && <AlertCircle className="w-3.5 h-3.5" />}
                      {payout.status === 'SUCCESS' ? 'Recebido' :
                       payout.status === 'PROCESSING' ? 'Processando' :
                       payout.status === 'FAILED' ? 'Falhou' :
                       'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payout.status === 'FAILED' && (
                      <button
                        onClick={() => handleRetry(payout.id)}
                        disabled={retrying === payout.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${retrying === payout.id ? 'animate-spin' : ''}`} />
                        {getMessage('seller.payouts.retry')}
                      </button>
                    )}
                    {payout.errorMessage && payout.status === 'FAILED' && (
                      <p className="text-xs text-red-500 mt-1">{payout.errorMessage}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
