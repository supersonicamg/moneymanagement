'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-svh bg-stone flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-12 text-center">
          <div className="font-serif text-[44px] font-light tracking-[-0.02em] text-ink leading-none">
            Paisa
          </div>
          <div className="text-[9px] tracking-[.2em] uppercase text-ash mt-2">
            Your money, clearly
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-px">
            <div className="border border-linen bg-stone">
              <label className="block px-4 pt-3 text-[8px] tracking-[.15em] uppercase text-ash">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="block w-full px-4 pb-3 pt-1 text-[14px] text-char bg-transparent outline-none placeholder:text-silk"
                placeholder="you@example.com"
              />
            </div>
            <div className="border border-linen bg-stone">
              <label className="block px-4 pt-3 text-[8px] tracking-[.15em] uppercase text-ash">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="block w-full px-4 pb-3 pt-1 text-[14px] text-char bg-transparent outline-none placeholder:text-silk"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="mt-3 text-[11px] text-brand-red tracking-[.02em]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full bg-char text-stone text-[11px] tracking-[.14em] uppercase py-4 transition-opacity disabled:opacity-40 hover:opacity-80 cursor-pointer"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-[11px] text-ash">No account? </span>
          <Link href="/signup" className="text-[11px] text-char underline underline-offset-2">
            Create one
          </Link>
        </div>

      </div>
    </div>
  )
}
