import { getProductById } from '@/actions/product'
import { auth } from '@/lib/auth'
import { AddToCartButton } from './AddToCartButton'
import { Store, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Link href="/products" className="text-primary hover:underline mt-2 inline-block">
          Back to Products
        </Link>
      </div>
    )
  }

  const isOwner = session?.user?.id === product.sellerId

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-lg"
            />
          ) : (
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">No Image Available</span>
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <span className="text-sm text-muted-foreground">
              {product.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold mt-1">{product.name}</h1>

          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <Store className="w-4 h-4" />
            <span>Sold by {product.seller.name}</span>
          </div>

          <div className="mt-4">
            {product.currentPrice < product.basePrice && (
              <p className="text-sm text-muted-foreground line-through">
                ${product.basePrice.toFixed(2)}
              </p>
            )}
            <p className="text-3xl font-bold text-primary">
              ${product.currentPrice.toFixed(2)}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground">
              {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
            </p>
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {!isOwner && product.quantity > 0 && (
            <AddToCartButton productId={product.id} session={session} />
          )}

          {isOwner && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="font-medium">You are selling this product</p>
              <p className="text-sm text-muted-foreground mt-1">
                This is your product listing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
