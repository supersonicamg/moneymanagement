'use client'

import { useRef } from 'react'
import Sheet from '@/components/Sheet'

interface Props {
  open: boolean
  currentBalance: number
  onClose: () => void
  onSave: (balance: number) => void
}

const fieldCls = 'w-full bg-transparent border-0 border-b border-silk outline-none font-sans text-[15px] font-light text-char py-2 placeholder:text-silk focus:border-char transition-colors'
const labelCls = 'block text-[9px] tracking-[.16em] uppercase text-ash mb-2'

export default function BalanceSheet({ open, currentBalance, onClose, onSave }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const amt = parseFloat(inputRef.current?.value ?? '')
    if (Number.isNaN(amt)) return
    onSave(amt)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Set balance">
      <div className="mb-7">
        <label className={labelCls}>Current balance</label>
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          defaultValue={currentBalance}
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
