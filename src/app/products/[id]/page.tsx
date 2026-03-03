import { getProductById } from '@/actions/product'
import { auth } from '@/lib/auth'
import { AddToCartButton } from './AddToCartButton'
import { Store, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getMessage } from '@/lib/messages'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  const session = await auth()

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg mb-4">Produto não encontrado</p>
        <Link href="/products" className="text-primary hover:underline">
          Voltar para produtos
        </Link>
      </div>
    )
  }

  const isOwner = session?.user?.id === product.sellerId

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para produtos
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square relative overflow-hidden rounded-2xl bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground">Imagem Não Disponível</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            {product.category && (
              <span className="text-sm text-muted-foreground">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3 p-4 bg-card rounded-xl border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Produtor</p>
              <p className="font-semibold">{product.seller.name}</p>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              {product.currentPrice < product.basePrice && (
                <p className="text-lg text-muted-foreground line-through">
                  R$ {product.basePrice.toFixed(2).replace('.', ',')}
                </p>
              )}
              <p className="text-4xl font-bold text-primary">
                R$ {product.currentPrice.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <p className={`mt-2 ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.quantity > 0 ? `✓ ${product.quantity} unidades em estoque` : '✗ Produto indisponível'}
            </p>
          </div>

          {product.description && (
            <div className="p-4 bg-card rounded-xl border">
              <h2 className="font-semibold mb-2">{getMessage('product.description')}</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {!isOwner && product.quantity > 0 && (
            <AddToCartButton productId={product.id} session={session} />
          )}

          {isOwner && (
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <p className="font-medium-primary">Você está text vendendo este produto</p>
              <p className="text-sm text-muted-foreground mt-1">
                Este é seu anúncio
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
