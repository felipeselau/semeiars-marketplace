import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { ShoppingCart, Package, User, LogOut, Plus } from 'lucide-react'

export default async function Navbar() {
  const session = await auth()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Semeiars
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>

          {session ? (
            <>
              <Link href="/cart" className="hover:text-primary flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Link>
              <Link href="/orders" className="hover:text-primary flex items-center gap-1">
                <Package className="w-4 h-4" />
                Orders
              </Link>
              {session.user.role === 'SELLER' && (
                <Link href="/products/new" className="hover:text-primary flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Sell
                </Link>
              )}
              <Link href="/profile" className="hover:text-primary flex items-center gap-1">
                <User className="w-4 h-4" />
                {session.user.name}
              </Link>
              <form
                action={async () => {
                  'use server'
                  await signOut()
                }}
              >
                <button type="submit" className="hover:text-primary flex items-center gap-1">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
