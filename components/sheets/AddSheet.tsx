'use client'

import { useState, useRef, useEffect } from 'react'
import { CATEGORIES, type TxType } from '@/lib/types'
import { todayStr } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: {
    type: TxType
    amount: number
    description: string
    category: string
    date: string
    note: string
  }) => void
}

const CAT_LABEL: Record<string, string> = {
  Entertainment: 'Fun',
  Education: 'Edu',
  Investment: 'Invest',
  Transport: 'Transit',
  Freelance: 'Gig',
}

const fieldCls = 'w-full bg-transparent border-0 border-b border-silk outline-none font-sans font-light text-char py-2 placeholder:text-silk focus:border-char transition-colors'
const labelCls = 'block text-[9px] tracking-[.16em] uppercase text-ash mb-1.5'

export default function AddSheet({ open, onClose, onSave }: Props) {
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(todayStr())
  const [note, setNote] = useState('')
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      // Auto-focus amount on open
      setTimeout(() => amountRef.current?.focus(), 350)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const reset = () => {
    setType('expense')
    setAmount('')
    setDescription('')
    setCategory('Food')
    setDate(todayStr())
    setNote('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (!description.trim()) return
    onSave({ type, amount: amt, description: description.trim(), category, date, note: note.trim() })
    reset()
    onClose()
  }

  const addQuick = (n: number) => {
    const cur = parseFloat(amount) || 0
    setAmount(String(cur + n))
  }

  const isIncome = type === 'income'
  const accentCls = isIncome ? 'text-brand-green' : 'text-brand-red'
  const accentHex = isIncome ? '#3A6B4A' : '#C1440E'
  const saveBg = isIncome ? 'bg-brand-green' : 'bg-brand-red'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" onClick={handleClose}>
      <div className="absolute inset-0 bg-ink/45" />
      <div
        className="animate-sheet absolute bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-stone max-h-[94svh] overflow-y-auto md:rounded-sm md:shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="md:hidden flex justify-center pt-3.5 pb-0 sticky top-0 bg-stone z-10">
          <div className="w-9 h-1 bg-silk rounded-full" />
        </div>

        {/* ── Type toggle + amount ─────────────────── */}
        <div className="px-6 pt-5 pb-6 border-b border-linen">
          {/* Type toggle row with close */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex flex-1 border border-silk">
              <button
                onClick={() => setType('income')}
                className={`flex-1 py-2.5 text-[10px] tracking-[.12em] uppercase cursor-pointer transition-all duration-200 ${
                  isIncome ? 'bg-brand-green text-white' : 'bg-transparent text-ash hover:text-char'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setType('expense')}
                className={`flex-1 py-2.5 text-[10px] tracking-[.12em] uppercase cursor-pointer transition-all duration-200 ${
                  !isIncome ? 'bg-brand-red text-white' : 'bg-transparent text-ash hover:text-char'
                }`}
              >
                Expense
              </button>
            </div>
            <button
              onClick={handleClose}
              className="text-ash hover:text-char transition-colors text-2xl leading-none p-1 cursor-pointer shrink-0"
            >
              ×
            </button>
          </div>

          {/* Amount — big display backed by hidden input */}
          <div
            className="flex items-center justify-center gap-1.5 mb-5 cursor-text"
            onClick={() => amountRef.current?.focus()}
          >
            <span
              className={`font-serif text-[22px] font-light transition-colors ${amount ? accentCls : 'text-silk'}`}
            >
              ₹
            </span>
            <div
              className={`font-serif font-light leading-none transition-colors ${amount ? accentCls : 'text-silk'}`}
              style={{ fontSize: '3.25rem' }}
            >
              {amount || '0'}
            </div>
            {/* Hidden input captures keyboard input */}
            <input
              ref={amountRef}
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="absolute opacity-0 w-px h-px"
              tabIndex={-1}
            />
          </div>
          {/* Underline acts as cursor indicator */}
          <div
            className="h-px mx-auto mb-5 transition-colors duration-200"
            style={{
              width: '72px',
              background: amount ? accentHex : '#D6D0C8',
            }}
          />

          {/* Quick-add amounts */}
          <div className="flex gap-2">
            {[50, 100, 500, 1000].map(n => (
              <button
                key={n}
                onClick={() => addQuick(n)}
                className="flex-1 py-1.5 text-[9px] tracking-widest border border-silk text-ash hover:border-ash hover:text-char active:bg-linen transition-all cursor-pointer"
              >
                +{n >= 1000 ? '1K' : n}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category grid ────────────────────────── */}
        <div className="px-6 py-5 border-b border-linen">
          <div className={labelCls}>Category</div>
          <div className="grid grid-cols-4 gap-1.5">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`py-2 text-[9px] tracking-wider uppercase border transition-all duration-150 cursor-pointer ${
                  category === c
                    ? 'text-stone border-char bg-char'
                    : 'text-ash border-silk hover:border-ash hover:text-char'
                }`}
              >
                {CAT_LABEL[c] ?? c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Fields ───────────────────────────────── */}
        <div className="px-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <div className="mb-5">
            <label className={labelCls}>What was it?</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
              className={fieldCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelCls}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={fieldCls}
              />
            </div>
            <div>
              <label className={labelCls}>Note</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional"
                className={fieldCls}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full text-stone text-[11px] tracking-[.14em] uppercase py-4 cursor-pointer hover:opacity-85 active:opacity-70 transition-all font-medium ${saveBg}`}
          >
            {isIncome ? 'Save Income' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
