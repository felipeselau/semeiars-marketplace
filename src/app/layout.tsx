import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { getMessage } from '@/lib/messages'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: `${getMessage('brand.name')} - ${getMessage('brand.slogan')}`,
  description: getMessage('brand.tagline'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${inter.variable} ${poppins.variable} font-body min-h-screen flex flex-col`}
      >
        {process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true' && (
          <div className="bg-amber-500 text-white text-center text-xs py-1 font-medium">
            ⚠ Ambiente de Staging — Dados de teste
          </div>
        )}
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <footer className="border-t py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              {getMessage('brand.name')} © {new Date().getFullYear()} -{' '}
              {getMessage('footer.rights')}
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
