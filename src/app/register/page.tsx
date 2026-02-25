'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/actions/auth'
import { getMessage } from '@/lib/messages'
import { Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await registerUser(formData)

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">{getMessage('auth.register_title')}</h1>
        <p className="text-muted-foreground">
          Crie sua conta no {getMessage('brand.name')}
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Nome completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Seu nome"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            {getMessage('auth.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            {getMessage('auth.password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Telefone (opcional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(51) 99999-9999"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            Endereço (opcional)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <textarea
              id="address"
              name="address"
              rows={2}
              placeholder="Sua rua, número, cidade - RS"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
          {loading ? 'Criando conta...' : getMessage('cta.register')}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>

      <p className="mt-6 text-center text-muted-foreground">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {getMessage('cta.login')}
        </Link>
      </p>
    </div>
  )
}
