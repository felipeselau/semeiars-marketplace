import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSellerPayment, setupSellerPayment } from '@/actions/payment'
import { getMessage } from '@/lib/messages'
import { revalidatePath } from 'next/cache'

export default async function PaymentSettingsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SELLER') {
    redirect('/')
  }

  const sellerPayment = await getSellerPayment(session.user.id)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{getMessage('seller.paymentSettings.title')}</h1>
      <p className="text-muted-foreground mb-8">
        {getMessage('seller.paymentSettings.description')}
      </p>

      <form action={async (formData) => {
        'use server'
        
        const sessionData = await auth()
        
        const data = {
          cpfCnpj: formData.get('cpfCnpj') as string,
          pixKey: formData.get('pixKey') as string,
          pixKeyType: formData.get('pixKeyType') as 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE',
          pixBank: formData.get('pixBank') as string || undefined,
          termsAccepted: formData.get('termsAccepted') === 'on',
        }

        const result = await setupSellerPayment(sessionData!.user.id, data)
        
        if (result.error) {
          console.error('Payment setup error:', result.error)
        }
        
        revalidatePath('/seller/payment-settings')
      }} className="space-y-6">
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">{getMessage('seller.paymentSettings.pixInfo')}</h2>
          
          <div className="grid gap-4">
            <div>
              <label htmlFor="cpfCnpj" className="block text-sm font-medium mb-2">
                {getMessage('seller.paymentSettings.cpfCnpj')}
              </label>
              <input
                id="cpfCnpj"
                name="cpfCnpj"
                type="text"
                defaultValue={sellerPayment?.cpfCnpj || ''}
                placeholder="123.456.789-00 ou 12.345.678/0001-90"
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="pixKeyType" className="block text-sm font-medium mb-2">
                {getMessage('seller.paymentSettings.pixKeyType')}
              </label>
              <select
                id="pixKeyType"
                name="pixKeyType"
                defaultValue={sellerPayment?.pixKeyType || ''}
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">{getMessage('seller.paymentSettings.selectType')}</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">E-mail</option>
                <option value="TELEFONE">Telefone</option>
              </select>
            </div>

            <div>
              <label htmlFor="pixKey" className="block text-sm font-medium mb-2">
                {getMessage('seller.paymentSettings.pixKey')}
              </label>
              <input
                id="pixKey"
                name="pixKey"
                type="text"
                defaultValue={sellerPayment?.pixKey || ''}
                placeholder={sellerPayment?.pixKey || getMessage('seller.paymentSettings.pixKeyPlaceholder')}
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {sellerPayment?.pixKeyMasked && (
                <p className="text-sm text-muted-foreground mt-1">
                  Chave atual: {sellerPayment.pixKeyMasked}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pixBank" className="block text-sm font-medium mb-2">
                {getMessage('seller.paymentSettings.pixBank')} (opcional)
              </label>
              <input
                id="pixBank"
                name="pixBank"
                type="text"
                defaultValue={sellerPayment?.pixBank || ''}
                placeholder="Nubank, Itaú, Banco do Brasil, etc."
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">{getMessage('seller.paymentSettings.terms')}</h2>
          <div className="prose prose-sm text-muted-foreground mb-4">
            <p>Ao aceitar estes termos, você concorda com:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Taxa de comissão de 10% sobre cada venda</li>
              <li>Taxa fixa de R$ 1,00 por transação (R$ 0,80 AbacatePay + R$ 0,20 Plataforma)</li>
              <li>Recebimento via PIX após confirmação do pagamento</li>
              <li>Responsabilidade pela precisão dos dados cadastrais</li>
            </ul>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="termsAccepted"
              defaultChecked={sellerPayment?.termsAccepted || false}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              required
            />
            <span className="text-sm">
              {getMessage('seller.paymentSettings.acceptTerms')}
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          {getMessage('seller.paymentSettings.save')}
        </button>

        {sellerPayment && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Status: {sellerPayment.isActive ? 'Ativo' : 'Inativo'}
              {sellerPayment.isVerified && ' • Verificado'}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
