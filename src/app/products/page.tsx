import Link from 'next/link'
import { getProducts } from '@/actions/product'
import { getCategories } from '@/actions/category'
import { getMessage } from '@/lib/messages'
import { Search, Filter } from 'lucide-react'
import type { ProductWithRelations, Category } from '@/types/database'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const search = params.search
  const categoryId = params.category
  const products: ProductWithRelations[] = await getProducts(search, categoryId)
  const categories: Category[] = await getCategories()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{getMessage('product.list_title')}</h1>
        <p className="text-muted-foreground">
          Encontre os melhores produtos direto de produtores do RS
        </p>
      </div>

      <form className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-card rounded-xl border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            name="search"
            placeholder="Buscar produtos..."
            defaultValue={search}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <select
          name="category"
          defaultValue={categoryId}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
      </form>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <p className="text-muted-foreground text-lg mb-4">{getMessage('empty_states.no_products')}</p>
          <Link href="/products" className="text-primary hover:underline">
            Limpar filtros
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-card group"
              >
                <div className="aspect-square relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">Sem Imagem</span>
                    </div>
                  )}
                  {product.category && (
                    <span className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      {product.category.name}
                    </span>
                  )}
                  {product.currentPrice < product.basePrice && (
                    <span className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                      -{Math.round((1 - product.currentPrice / product.basePrice) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {product.seller.name}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      {product.currentPrice < product.basePrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          R$ {product.basePrice.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                      <p className="text-primary font-bold text-lg">
                        R$ {product.currentPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <p className={`text-xs ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.quantity > 0 ? `${product.quantity} un` : 'Indisponível'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
