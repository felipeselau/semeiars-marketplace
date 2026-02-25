import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getProducts } from '@/actions/product'

export default async function HomePage() {
  const session = await auth()
  const products = await getProducts()

  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Semeiars</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your C2C e-commerce platform for buying and selling
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90"
          >
            Browse Products
          </Link>
          {!session && (
            <Link
              href="/register"
              className="border border-input px-6 py-3 rounded-md hover:bg-accent"
            >
              Get Started
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {product.category?.name}
                  </p>
                  <p className="text-primary font-bold mt-2">
                    ${product.currentPrice.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
