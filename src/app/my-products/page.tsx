import { auth } from '@/lib/auth'
import { getProductsBySeller } from '@/actions/product'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Plus, ArrowRight } from 'lucide-react'
import { getMessage } from '@/lib/messages'

export default async function MyProductsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'SELLER') {
    redirect('/profile')
  }

  const products = await getProductsBySeller(session.user.id)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{getMessage('profile.my_products')}</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus produtos anunciados</p>
        </div>
        <Link
          href="/products/new"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg mb-6">
            {getMessage('empty_states.no_sales')}
          </p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Criar primeiro produto <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-4 px-6 font-medium">Produto</th>
                <th className="text-left py-4 px-6 font-medium">Preço</th>
                <th className="text-left py-4 px-6 font-medium">Estoque</th>
                <th className="text-left py-4 px-6 font-medium">Categoria</th>
                <th className="text-right py-4 px-6 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Img</span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      {product.currentPrice < product.basePrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          R$ {product.basePrice.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                      <p className="font-bold text-primary">
                        R$ {product.currentPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={product.quantity === 0 ? 'text-red-500' : ''}>
                      {product.quantity} un
                    </span>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">
                    {product.category?.name || '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Ver <ArrowRight className="w-4 h-4" />
                    </Link>
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
