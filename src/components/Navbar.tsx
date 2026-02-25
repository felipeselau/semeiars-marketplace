import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { ShoppingCart, Package, User, LogOut, Plus } from 'lucide-react'
import { getMessage } from '@/lib/messages'

export default async function Navbar() {
  const session = await auth()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
          {getMessage('brand.name')}
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/products" className="hover:text-primary transition-colors">
            {getMessage('product.list_title')}
          </Link>

          {session ? (
            <>
              <Link href="/cart" className="hover:text-primary flex items-center gap-1 transition-colors">
                <ShoppingCart className="w-4 h-4" />
                {getMessage('cart.title')}
              </Link>
              <Link href="/orders" className="hover:text-primary flex items-center gap-1 transition-colors">
                <Package className="w-4 h-4" />
                {getMessage('profile.my_orders')}
              </Link>
              {session.user.role === 'SELLER' && (
                <Link href="/products/new" className="hover:text-primary flex items-center gap-1 transition-colors">
                  <Plus className="w-4 h-4" />
                  {getMessage('cta.sell')}
                </Link>
              )}
              <Link href="/profile" className="hover:text-primary flex items-center gap-1 transition-colors">
                <User className="w-4 h-4" />
                {session.user.name}
              </Link>
              <form
                action={async () => {
                  'use server'
                  await signOut()
                }}
              >
                <button type="submit" className="hover:text-primary flex items-center gap-1 transition-colors">
                  <LogOut className="w-4 h-4" />
                  {getMessage('auth.logout')}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary transition-colors">
                {getMessage('cta.login')}
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                {getMessage('cta.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
