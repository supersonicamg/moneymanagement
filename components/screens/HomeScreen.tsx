'use client'

import { useAppData } from '@/lib/DataContext'
import { fmt, filterByMonth, sumIncome, sumExpense, MONTH_NAMES } from '@/lib/utils'

function SavingsRate({ income, expense }: { income: number; expense: number }) {
  if (income === 0) return null
  const rate = Math.round(((income - expense) / income) * 100)
  const color = rate >= 20 ? '#3A6B4A' : rate >= 0 ? '#9B958D' : '#C1440E'
  return (
    <div className="flex flex-col items-center px-4 border-l border-linen">
      <span className="text-[13px] font-medium" style={{ color }}>{rate}%</span>
      <span className="text-[9px] tracking-widest uppercase text-ash mt-0.5">Saved</span>
    </div>
  )
}

function BudgetBar({ b, monthTxs }: {
  b: { id: string; category: string; monthly_limit: number };
  monthTxs: ReturnType<typeof filterByMonth>
}) {
  const spent = monthTxs
    .filter(t => t.type === 'expense' && t.category === b.category)
    .reduce((a, t) => a + t.amount, 0)
  const pct = Math.min(100, Math.round((spent / b.monthly_limit) * 100))
  const over = spent > b.monthly_limit
  const warn = !over && pct >= 75

  let barColor = '#3A6B4A'
  if (over) barColor = '#C1440E'
  else if (warn) barColor = '#C17A0E'

  return (
    <div className="py-4 border-b border-linen last:border-none">
      <div className="flex justify-between items-baseline mb-2">
        <div className="flex items-center gap-1.5">
          {over && <span className="text-brand-red text-[10px]">▲</span>}
          <span className="text-[13px] text-char">{b.category}</span>
        </div>
        <span className="font-serif text-[14px] text-ash">
          <span className={over ? 'text-brand-red' : 'text-char'}>{fmt(spent)}</span>
          {' '}/{' '}{fmt(b.monthly_limit)}
        </span>
      </div>
      <div className="h-[3px] bg-linen rounded-full relative">
        <div
          className="absolute top-0 left-0 h-[3px] rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-ash">{pct}% used</span>
        <span className="text-[10px]" style={{ color: over ? '#C1440E' : warn ? '#C17A0E' : '#9B958D' }}>
          {over ? `over by ${fmt(spent - b.monthly_limit)}` : `${fmt(b.monthly_limit - spent)} left`}
        </span>
      </div>
    </div>
  )
}

export default function HomeScreen() {
  const { transactions: rawTransactions, budgets, deleteTransaction, showToast } = useAppData()
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : []

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
      {/* Balance hero */}
      <div className="pt-12 pb-8 border-b border-linen">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-3">
          {MONTH_NAMES[m]} {y}
        </div>
        <div
          className={`font-serif text-[44px] md:text-[64px] font-light leading-none tracking-[-0.02em] mb-5 ${
            balance < 0 ? 'text-brand-red' : 'text-ink'
          }`}
        >
          {balance < 0 ? '−' : ''}{fmt(balance)}
        </div>
        <div className="flex items-stretch">
          <div className="flex flex-col pr-5">
            <span className="text-[13px] font-medium text-brand-green">{fmt(income)}</span>
            <span className="text-[9px] tracking-widest uppercase text-ash mt-0.5">Income</span>
          </div>
          <div className="w-px bg-linen self-stretch" />
          <div className="flex flex-col px-5">
            <span className="text-[13px] font-medium text-brand-red">{fmt(expense)}</span>
            <span className="text-[9px] tracking-widest uppercase text-ash mt-0.5">Spent</span>
          </div>
          <div className="w-px bg-linen self-stretch" />
          <SavingsRate income={income} expense={expense} />
        </div>
      </div>

      {/* This week */}
      <div className="pt-7 pb-7 border-b border-linen">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-4">This week</div>
        <div className="grid grid-cols-7 gap-1.5 items-end h-14 mb-2">
          {weekDays.map((d, i) => {
            const h = weekVals[i] === 0 ? 2 : Math.max(4, Math.round((weekVals[i] / maxVal) * 48))
            const isToday = d === todayStr
            return (
              <div key={d} className="flex flex-col items-center gap-1 h-14 justify-end">
                <div
                  className="w-full rounded-sm transition-all duration-500"
                  style={{
                    height: h,
                    background: isToday ? '#1C1C1A' : weekVals[i] > 0 ? '#D6D0C8' : '#EDE9E3',
                  }}
                  title={weekVals[i] > 0 ? fmt(weekVals[i]) : '—'}
                />
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {DAY_LABELS.map((l, i) => (
            <div
              key={i}
              className={`text-center text-[8px] uppercase tracking-[.06em] ${
                weekDays[i] === todayStr ? 'text-char font-medium' : 'text-ash'
              }`}
            >
              {l}
            </div>
          ))}
        </div>
        {weekVals.some(v => v > 0) && (
          <div className="mt-3 text-[10px] text-ash">
            Total this week:{' '}
            <span className="text-char font-medium">
              {fmt(weekVals.reduce((a, v) => a + v, 0))}
            </span>
          </div>
        )}
      </div>

      {/* Budgets */}
      <div className="pt-7">
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-[9px] tracking-[.16em] uppercase text-ash">Budgets</div>
          {budgets.length > 3 && (
            <span className="text-[9px] text-ash">{budgets.length} total</span>
          )}
        </div>
        {budgets.length === 0 ? (
          <div className="py-10 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No budgets set
          </div>
        ) : (
          budgets
            .map(b => {
              const spent = monthTxs
                .filter(t => t.type === 'expense' && t.category === b.category)
                .reduce((a, t) => a + t.amount, 0)
              return { ...b, pct: spent / b.monthly_limit }
            })
            .sort((a, b) => b.pct - a.pct)
            .slice(0, 3)
            .map(b => <BudgetBar key={b.id} b={b} monthTxs={monthTxs} />)
        )}
      </div>

      {/* Recent transactions */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-1">Recent</div>
        {recent.length === 0 ? (
          <div className="py-10 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No entries yet
          </div>
        ) : (
          recent.map(t => {
            const isInc = t.type === 'income'
            return (
              <div key={t.id} className="group flex items-center py-3.5 border-b border-linen last:border-none gap-3">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isInc ? 'bg-brand-green' : 'bg-brand-red'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-char truncate">{t.description}</div>
                  <div className="text-[10px] text-ash mt-0.5 tracking-[.04em]">{t.category} · {t.date}</div>
                </div>
                <div className={`font-serif text-[17px] flex-shrink-0 ${isInc ? 'text-brand-green' : 'text-brand-red'}`}>
                  {isInc ? '+' : '−'}{fmt(t.amount)}
                </div>
                <button
                  onClick={async () => { await deleteTransaction(t.id); showToast('Deleted') }}
                  className="text-silk text-base cursor-pointer p-2 -mr-1 opacity-40 md:opacity-0 md:group-hover:opacity-100 hover:text-brand-red transition-all duration-150 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
