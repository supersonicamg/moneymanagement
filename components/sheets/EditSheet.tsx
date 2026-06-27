'use client'

import { useState, useEffect } from 'react'
import Sheet from '@/components/Sheet'
import { CATEGORIES, type TxType, type Transaction } from '@/lib/types'

interface Props {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
  onSave: (id: string, data: {
    type: TxType
    amount: number
    description: string
    category: string
    date: string
    note: string
  }) => void
}

const fieldCls = 'w-full bg-transparent border-0 border-b border-silk outline-none font-sans text-[15px] font-light text-char py-2 placeholder:text-silk focus:border-char transition-colors'
const labelCls = 'block text-[9px] tracking-[.16em] uppercase text-ash mb-2'

export default function EditSheet({ open, transaction, onClose, onSave }: Props) {
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  // Sync fields whenever a different transaction is loaded
  useEffect(() => {
    if (transaction) {
      setType(transaction.type === 'transfer' ? 'expense' : transaction.type)
      setAmount(String(transaction.amount))
      setDescription(transaction.description)
      setCategory(transaction.category)
      setDate(transaction.date)
      setNote(transaction.note ?? '')
    }
  }, [transaction])

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (!description.trim()) return
    if (!transaction) return
    onSave(transaction.id, { type, amount: amt, description: description.trim(), category, date, note: note.trim() })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Edit entry">
      {/* Type toggle */}
      <div className="flex border border-silk mb-7">
        <button
          onClick={() => setType('income')}
          className={`flex-1 py-[11px] text-[10px] tracking-[.12em] uppercase cursor-pointer transition-all duration-200 ${
            type === 'income' ? 'bg-brand-green text-white' : 'bg-transparent text-ash'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setType('expense')}
          className={`flex-1 py-[11px] text-[10px] tracking-[.12em] uppercase cursor-pointer transition-all duration-200 ${
            type === 'expense' ? 'bg-brand-red text-white' : 'bg-transparent text-ash'
          }`}
        >
          Expense
        </button>
      </div>

      <div className="mb-6">
        <label className={labelCls}>Amount</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          className={`${fieldCls} font-serif text-[32px] font-light`}
        />
      </div>

      <div className="mb-6">
        <label className={labelCls}>Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What was it?"
          className={fieldCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={fieldCls}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={fieldCls} />
        </div>
      </div>

      <div className="mb-7">
        <label className={labelCls}>Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="—"
          className={fieldCls}
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-char text-stone text-[11px] tracking-[.14em] uppercase py-3.5 cursor-pointer hover:opacity-85 active:opacity-70 transition-opacity"
      >
        Save changes
      </button>
    </Sheet>
  )
}
