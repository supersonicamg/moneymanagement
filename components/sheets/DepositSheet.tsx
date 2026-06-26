'use client'

import { useState } from 'react'
import Sheet from '@/components/Sheet'

interface Props {
  open: boolean
  goalName: string
  onClose: () => void
  onSave: (amount: number) => void
}

const fieldCls = 'w-full bg-transparent border-0 border-b border-silk outline-none font-sans text-[15px] font-light text-char py-2 placeholder:text-silk focus:border-char transition-colors'
const labelCls = 'block text-[9px] tracking-[.16em] uppercase text-ash mb-2'

export default function DepositSheet({ open, goalName, onClose, onSave }: Props) {
  const [amount, setAmount] = useState('')

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    onSave(amt)
    setAmount('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { setAmount(''); onClose() }} title={goalName || 'Add savings'}>
      <div className="mb-7">
        <label className={labelCls}>Amount to add</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
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
