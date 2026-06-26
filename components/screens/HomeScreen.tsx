'use client'

import type { Transaction, Budget, Goal } from '@/lib/types'
import { fmt, filterByMonth, sumIncome, sumExpense, MONTH_NAMES } from '@/lib/utils'

interface Props {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
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

function BudgetRow({ b, monthTxs }: { b: Budget; monthTxs: Transaction[] }) {
  const spent = monthTxs.filter(t => t.type === 'expense' && t.category === b.category)
    .reduce((a, t) => a + t.amount, 0)
  const pct = Math.min(100, Math.round((spent / b.monthly_limit) * 100))
  const over = spent > b.monthly_limit
  return (
    <div className="py-5 border-b border-linen last:border-none">
      <div className="flex justify-between items-baseline mb-2.5">
        <span className="text-[13px] text-char font-normal">{b.category}</span>
        <span className="font-serif text-[15px] text-ash">
          <b className="font-normal text-char">{fmt(spent)}</b> / {fmt(b.monthly_limit)}
        </span>
      </div>
      <div className="h-px bg-linen relative">
        <div
          className="absolute top-0 left-0 h-px transition-all duration-700"
          style={{ width: `${pct}%`, background: over ? '#C1440E' : '#1C1C1A' }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-ash tracking-[.04em]">{pct}% used</span>
        <span className={`text-[10px] tracking-[.04em] ${over ? 'text-brand-red' : 'text-ash'}`}>
          {over ? `over by ${fmt(spent - b.monthly_limit)}` : `${fmt(b.monthly_limit - spent)} left`}
        </span>
      </div>
    </div>
  )
}

export default function HomeScreen({ transactions, budgets, onDeleteTx }: Props) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const monthTxs = filterByMonth(transactions, y, m)
  const income = sumIncome(monthTxs)
  const expense = sumExpense(monthTxs)
  const balance = income - expense

  // Week bars
  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
  const weekVals = weekDays.map(d =>
    transactions.filter(t => t.type === 'expense' && t.date === d).reduce((a, t) => a + t.amount, 0)
  )
  const maxVal = Math.max(...weekVals, 1)
  const todayStr = now.toISOString().split('T')[0]
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const recent = transactions.slice(0, 5)

  return (
    <div>
      {/* Balance block */}
      <div className="pt-12 pb-9 border-b border-linen">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-3">{MONTH_NAMES[m]}</div>
        <div className={`font-serif text-[52px] md:text-[64px] font-light leading-none tracking-[-0.02em] ${balance < 0 ? 'text-brand-red' : 'text-ink'}`}>
          {balance < 0 ? '−' : ''}{fmt(balance)}
        </div>
        <div className="flex gap-6 mt-4">
          <span className="text-[11px] text-ash tracking-[.04em]">
            <b className="font-normal text-char">{fmt(income)}</b> in
          </span>
          <span className="text-[11px] text-ash tracking-[.04em]">
            <b className="font-normal text-char">{fmt(expense)}</b> out
          </span>
        </div>
      </div>

      {/* Week spending */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-4">This week</div>
        <div className="grid grid-cols-7 gap-1 items-end h-16 mb-1.5">
          {weekDays.map((d, i) => {
            const h = Math.max(3, Math.round((weekVals[i] / maxVal) * 56))
            return (
              <div key={d} className="flex items-end h-16">
                <div
                  className={`w-full rounded-sm ${d === todayStr ? 'bg-char' : 'bg-linen'} transition-all`}
                  style={{ height: h }}
                  title={fmt(weekVals[i])}
                />
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAY_LABELS.map((l, i) => (
            <div key={i} className="text-center text-[8px] text-ash uppercase tracking-[.06em]">{l}</div>
          ))}
        </div>
      </div>

      {/* Budgets snapshot */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-0">Budgets</div>
        {budgets.length === 0 ? (
          <div className="py-12 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No budgets set
          </div>
        ) : (
          budgets.slice(0, 3).map(b => <BudgetRow key={b.id} b={b} monthTxs={monthTxs} />)
        )}
      </div>

      {/* Recent transactions */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-0">Recent</div>
        {recent.length === 0 ? (
          <div className="py-12 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No entries yet
          </div>
        ) : (
          recent.map(t => <TxRow key={t.id} t={t} onDelete={() => onDeleteTx(t.id)} />)
        )}
      </div>
    </div>
  )
}
