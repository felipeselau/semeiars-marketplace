import Link from 'next/link'
import { getProducts } from '@/actions/product'
import { getCategories } from '@/actions/category'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const search = params.search
  const categoryId = params.category
  const products = await getProducts(search, categoryId)
  const categories = await getCategories()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <form className="flex gap-4 mb-6">
        <input
          type="text"
          name="search"
          placeholder="Search products..."
          defaultValue={search}
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <select
          name="category"
          defaultValue={categoryId}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
                  {product.category?.name || 'Uncategorized'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Seller: {product.seller.name}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-primary font-bold">
                    ${product.currentPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.quantity} in stock
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
