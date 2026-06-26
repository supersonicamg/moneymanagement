'use client'

import { useState } from 'react'
import type { Transaction } from '@/lib/types'
import { fmt, filterByMonth, sumIncome, sumExpense, MONTH_NAMES } from '@/lib/utils'

const FILTERS = ['all', 'income', 'expense', 'Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Other'] as const
const FILTER_LABELS: Record<string, string> = { all: 'All', income: 'Income', expense: 'Expense', Entertainment: 'Fun' }

interface Props {
  transactions: Transaction[]
  onDeleteTx: (id: string) => void
}

function TxRow({ t, onDelete }: { t: Transaction; onDelete: () => void }) {
  const isInc = t.type === 'income'
  return (
    <div className="group flex items-center py-3.5 border-b border-linen last:border-none gap-3">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5 ${isInc ? 'bg-brand-green' : 'bg-brand-red'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-char font-normal truncate">{t.description}</div>
        <div className="text-[10px] text-ash mt-0.5 tracking-[.04em]">{t.category} · {t.date}</div>
      </div>
      <div className={`font-serif text-[17px] font-normal flex-shrink-0 ${isInc ? 'text-brand-green' : 'text-char'}`}>
        {isInc ? '+' : '−'}{fmt(t.amount)}
      </div>
      <button
        onClick={onDelete}
        className="text-silk text-sm cursor-pointer p-1 opacity-0 group-hover:opacity-100 hover:text-brand-red transition-all duration-150 flex-shrink-0"
      >
        ×
      </button>
    </div>
  )
}

export default function LogScreen({ transactions, onDeleteTx }: Props) {
  const now = new Date()
  const [logYear, setLogYear] = useState(now.getFullYear())
  const [logMonth, setLogMonth] = useState(now.getMonth())
  const [filter, setFilter] = useState<string>('all')

  const shiftMonth = (dir: number) => {
    let m = logMonth + dir
    let y = logYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setLogMonth(m)
    setLogYear(y)
  }

  let list = filterByMonth(transactions, logYear, logMonth)
  if (filter === 'income') list = list.filter(t => t.type === 'income')
  else if (filter === 'expense') list = list.filter(t => t.type === 'expense')
  else if (!['all', 'income', 'expense'].includes(filter)) list = list.filter(t => t.category === filter)

  const net = sumIncome(list) - sumExpense(list)

  return (
    <div>
      {/* Header */}
      <div className="pt-12 pb-6 border-b border-linen flex items-center justify-between">
        <div>
          <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-2">Transactions</div>
          <div className="flex items-center gap-4">
            <button onClick={() => shiftMonth(-1)} className="text-ash hover:text-char cursor-pointer text-base p-1 transition-colors">←</button>
            <span className="font-serif text-[15px] text-char tracking-[.02em] min-w-[100px] text-center">
              {MONTH_NAMES[logMonth].slice(0, 3)} {logYear}
            </span>
            <button onClick={() => shiftMonth(1)} className="text-ash hover:text-char cursor-pointer text-base p-1 transition-colors">→</button>
          </div>
        </div>
        <div className="text-right">
          <div
            className="font-serif text-[22px]"
            style={{ color: net < 0 ? '#C1440E' : '#3A6B4A' }}
          >
            {net < 0 ? '−' : '+'}{fmt(Math.abs(net))}
          </div>
          <div className="text-[10px] text-ash mt-0.5">net</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mt-5 mb-5 overflow-x-auto scrollbar-none pb-0.5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 border text-[10px] tracking-[.1em] uppercase px-3.5 py-1.5 cursor-pointer transition-all duration-150 ${
              filter === f
                ? 'bg-char text-stone border-char'
                : 'bg-transparent text-ash border-silk hover:border-char hover:text-char'
            }`}
          >
            {FILTER_LABELS[f] ?? f}
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="py-16 text-center text-ash text-[12px] tracking-[.06em]">
          <div className="w-8 h-px bg-silk mx-auto mb-5" />
          Nothing here
        </div>
      ) : (
        list.map(t => <TxRow key={t.id} t={t} onDelete={() => onDeleteTx(t.id)} />)
      )}
    </div>
  )
}
