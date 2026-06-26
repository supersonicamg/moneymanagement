'use client'

import { useState } from 'react'
import Sheet from '@/components/Sheet'
import { BUDGET_CATEGORIES } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (category: string, limit: number) => void
}

const fieldCls = 'w-full bg-transparent border-0 border-b border-silk outline-none font-sans text-[15px] font-light text-char py-2 placeholder:text-silk focus:border-char transition-colors'
const labelCls = 'block text-[9px] tracking-[.16em] uppercase text-ash mb-2'

export default function BudgetSheet({ open, onClose, onSave }: Props) {
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState('')

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    onSave(category, amt)
    setAmount('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Set budget">
      <div className="mb-6">
        <label className={labelCls}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className={fieldCls}>
          {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="mb-7">
        <label className={labelCls}>Monthly limit</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          className={`${fieldCls} font-serif text-[32px] font-light`}
        />
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-char text-stone text-[11px] tracking-[.14em] uppercase py-3.5 cursor-pointer hover:opacity-85 active:opacity-70 transition-opacity"
      >
        Save
      </button>
    </Sheet>
  )
}
