'use client'

import type { Transaction } from '@/lib/types'
import { fmt, filterByMonth, sumIncome, sumExpense, MONTH_NAMES } from '@/lib/utils'

interface Props {
  transactions: Transaction[]
  onExportCSV: () => void
  onResetData: () => void
}

export default function InsightsScreen({ transactions, onExportCSV, onResetData }: Props) {
  const allInc = sumIncome(transactions)
  const allExp = sumExpense(transactions)
  const allNet = allInc - allExp

  const now = new Date()
  const curExpenses = filterByMonth(transactions, now.getFullYear(), now.getMonth())
    .filter(t => t.type === 'expense')

  const catTotals: Record<string, number> = {}
  curExpenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount })
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1])
  const maxCat = Math.max(...sortedCats.map(([, v]) => v), 1)

  // 6-month trend
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { y: d.getFullYear(), m: d.getMonth(), label: MONTH_NAMES[d.getMonth()].slice(0, 3) }
  })
  const trend = months.map(({ y, m, label }) => {
    const list = filterByMonth(transactions, y, m)
    return { label, inc: sumIncome(list), exp: sumExpense(list) }
  })
  const maxTrend = Math.max(...trend.map(t => Math.max(t.inc, t.exp)), 1)

  const handleReset = () => {
    if (window.confirm('Delete all data? This cannot be undone.')) onResetData()
  }

  return (
    <div>
      <div className="pt-12 pb-8 border-b border-linen mb-0">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-2">Insights</div>
        <h1 className="font-serif text-[36px] font-light leading-none tracking-[-0.01em] text-ink">Overview</h1>
      </div>

      {/* All time stats */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-0">All time</div>
        {[
          { label: 'Total in', value: fmt(allInc), color: 'text-brand-green' },
          { label: 'Total out', value: fmt(allExp), color: 'text-brand-red' },
          { label: 'Net worth', value: (allNet < 0 ? '−' : '') + fmt(allNet), color: allNet < 0 ? 'text-brand-red' : '' },
          { label: 'Entries', value: String(transactions.length), color: '' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-baseline py-3.5 border-b border-linen last:border-none gap-4">
            <span className="text-[11px] text-ash tracking-[.06em] flex-1">{label}</span>
            <span className={`font-serif text-[18px] font-normal ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-4 pt-7 border-t border-linen">This month by category</div>
        {sortedCats.length === 0 ? (
          <div className="py-10 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No expenses this month
          </div>
        ) : (
          sortedCats.map(([cat, amt]) => (
            <div key={cat} className="flex items-center gap-2.5 py-2">
              <span className="text-[11px] text-ash w-[72px] flex-shrink-0 truncate">{cat}</span>
              <div className="flex-1 h-px bg-linen relative">
                <div
                  className="absolute top-0 left-0 h-px bg-char transition-all duration-500"
                  style={{ width: `${Math.round((amt / maxCat) * 100)}%` }}
                />
              </div>
              <span className="font-serif text-[12px] text-ash w-[72px] text-right flex-shrink-0">{fmt(amt)}</span>
            </div>
          ))
        )}
      </div>

      {/* 6-month trend */}
      <div className="pt-7 border-t border-linen mt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-4">6-month trend</div>
        {trend.map(t => (
          <div key={t.label} className="mb-3.5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-ash tracking-[.06em]">{t.label}</span>
              <span className="text-[10px] text-ash">{t.inc - t.exp >= 0 ? '+' : '−'}{fmt(Math.abs(t.inc - t.exp))}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="h-px bg-linen relative">
                <div
                  className="absolute top-0 left-0 h-px transition-all duration-500"
                  style={{ width: `${Math.round((t.inc / maxTrend) * 100)}%`, background: '#3A6B4A' }}
                />
              </div>
              <div className="h-px bg-linen relative">
                <div
                  className="absolute top-0 left-0 h-px transition-all duration-500"
                  style={{ width: `${Math.round((t.exp / maxTrend) * 100)}%`, background: '#C1440E' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-10 pt-7 border-t border-linen">
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
  )
}
