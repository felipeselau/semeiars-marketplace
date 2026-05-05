import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getProducts } from '@/actions/product'
import { getMessage } from '@/lib/messages'
import { ArrowRight, Leaf, Store, Heart } from 'lucide-react'
import type { ProductWithRelations } from '@/types/database'

export default async function HomePage() {
  const session = await auth()
  const products: ProductWithRelations[] = await getProducts()

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {getMessage('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">{getMessage('hero.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2 font-medium"
              >
                {getMessage('hero.cta_primary')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!session && (
                <Link
                  href="/register"
                  className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary/10 transition-colors inline-flex items-center justify-center gap-2 font-medium"
                >
                  {getMessage('hero.cta_secondary')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Produtos Frescos</h3>
            <p className="text-muted-foreground">Direct from local producers to your table</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Compra Direta</h3>
            <p className="text-muted-foreground">Sem intermediários, preço justo para todos</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Apoio Local</h3>
            <p className="text-muted-foreground">Fortaleça a economia do RS</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">{getMessage('product.list_title')}</h2>
          <Link
            href="/products"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            {getMessage('cta.see_more')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {getMessage('empty_states.no_products')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-card"
              >
                <div className="aspect-square relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
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
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{product.seller.name}</p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-primary font-bold text-lg">
                      R$ {product.currentPrice.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.quantity > 0 ? `${product.quantity} un` : 'Indisponível'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{getMessage('impact.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {getMessage('impact.text')}
          </p>
          {!session && (
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 font-medium"
            >
              {getMessage('cta.register')}
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
