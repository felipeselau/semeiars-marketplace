import { auth } from '@/lib/auth'
import { getProductsBySeller } from '@/actions/product'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Plus } from 'lucide-react'

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          href="/products/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">You haven&apos;t listed any products yet</p>
          <Link
            href="/products/new"
            className="text-primary hover:underline"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No Img</span>
                        </div>
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-primary font-bold">${product.currentPrice.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={product.quantity === 0 ? 'text-red-500' : ''}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {product.category?.name || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-2 hover:bg-accent rounded"
                        title="View"
                      >
                        <Package className="w-4 h-4" />
                      </Link>
                    </div>
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
