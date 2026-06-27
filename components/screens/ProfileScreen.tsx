'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  onExportCSV: () => void
  onResetData: () => void
  onSignOut: () => void
}

export default function ProfileScreen({ onExportCSV, onResetData, onSignOut }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? '')
        const meta = data.user.user_metadata ?? {}
        setName(meta.full_name || meta.name || meta.display_name || '')
      }
    })
  }, [])

  const handleReset = () => {
    if (window.confirm('Delete all data? This cannot be undone.')) onResetData()
  }

  const details = [
    { label: 'Email', value: email || '—' },
    ...(name ? [{ label: 'Name', value: name }] : []),
    { label: 'Currency', value: 'INR (₹)' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="pt-12 pb-8 border-b border-linen">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-2">Account</div>
        <h1 className="font-serif text-[36px] font-light leading-none tracking-[-0.01em] text-ink">Profile</h1>
      </div>

      {/* Account details */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-0">Details</div>
        {details.map(({ label, value }) => (
          <div key={label} className="flex items-baseline py-3.5 border-b border-linen last:border-none gap-4">
            <span className="text-[11px] text-ash tracking-[.06em] w-20 flex-shrink-0">{label}</span>
            <span className="font-serif text-[16px] font-normal text-char truncate text-right flex-1 min-w-0">{value}</span>
          </div>
        ))}
      </div>

      {/* Data actions */}
      <div className="pt-7 mt-7 border-t border-linen">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-4">Data</div>
        <div className="flex gap-3">
          <button
            onClick={onExportCSV}
            className="flex-1 border border-silk text-ash text-[10px] tracking-[.12em] uppercase py-3.5 hover:border-char hover:text-char transition-all cursor-pointer"
          >
            Export CSV
          </button>
          <button
            onClick={handleReset}
            className="flex-1 border text-brand-red text-[10px] tracking-[.12em] uppercase py-3.5 border-[#e8ccc4] hover:bg-brand-red hover:text-stone hover:border-brand-red transition-all cursor-pointer"
          >
            Clear data
          </button>
        </div>
      </div>

      {/* Sign out */}
      <div className="mt-4">
        <button
          onClick={onSignOut}
          className="w-full border border-silk text-ash text-[10px] tracking-[.14em] uppercase py-3.5 hover:border-brand-red hover:text-brand-red transition-all cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
