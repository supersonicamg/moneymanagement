'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] tracking-[.03em] transition-colors ${met ? 'text-brand-green' : 'text-ash'}`}>
      <span className="text-[8px]">{met ? '✓' : '·'}</span>
      {text}
    </div>
  )
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const rules = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const passwordOk = rules.length && rules.letter && rules.number

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordOk) {
      setError('Password does not meet the requirements.')
      return
    }
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name.trim() || email.split('@')[0] } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-svh bg-stone flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="font-serif text-[44px] font-light tracking-[-0.02em] text-ink leading-none mb-12">
            Paisa
          </div>
          <div className="w-8 h-px bg-silk mx-auto mb-6" />
          <div className="text-[13px] text-char mb-2">Check your email</div>
          <div className="text-[11px] text-ash leading-relaxed">
            We sent a confirmation link to <span className="text-char">{email}</span>.
            Click it to activate your account, then come back to sign in.
          </div>
          <Link
            href="/login"
            className="inline-block mt-8 text-[11px] tracking-[.14em] uppercase text-char underline underline-offset-2"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    )
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
                Name
              </label>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="block w-full px-4 pb-3 pt-1 text-[14px] text-char bg-transparent outline-none placeholder:text-silk"
                placeholder="Your name"
              />
            </div>
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
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="block w-full px-4 pb-3 pt-1 text-[14px] text-char bg-transparent outline-none placeholder:text-silk"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Password strength rules */}
          {password.length > 0 && (
            <div className="mt-3 space-y-1 pl-1">
              <PasswordRule met={rules.length} text="At least 8 characters" />
              <PasswordRule met={rules.letter} text="One letter" />
              <PasswordRule met={rules.number} text="One number" />
            </div>
          )}

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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-[11px] text-ash">Already have an account? </span>
          <Link href="/login" className="text-[11px] text-char underline underline-offset-2">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  )
}
