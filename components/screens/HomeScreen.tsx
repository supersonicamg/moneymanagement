'use client'

import { useState } from 'react'
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
  b: { id: string; category: string; monthly_limit: number }
  monthTxs: ReturnType<typeof filterByMonth>
}) {
  const spent = monthTxs
    .filter(t => t.type === 'expense' && t.category === b.category)
    .reduce((a, t) => a + t.amount, 0)
  const pct = Math.min(100, Math.round((spent / b.monthly_limit) * 100))
  const over = spent > b.monthly_limit
  const warn = !over && pct >= 75
  const barColor = over ? '#C1440E' : warn ? '#C17A0E' : '#3A6B4A'

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
      <div className="h-0.75 bg-linen rounded-full relative">
        <div
          className="absolute top-0 left-0 h-0.75 rounded-full transition-all duration-700"
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

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function fmtShort(d: Date) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`
}

export default function HomeScreen() {
  const { transactions: rawTransactions, budgets } = useAppData()
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : []

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const monthTxs = filterByMonth(transactions, y, m)
  const income = sumIncome(monthTxs)
  const expense = sumExpense(monthTxs)
  const balance = income - expense

  const todayStr = now.toISOString().split('T')[0]

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<string>(todayStr)

  // Monday of the current real week
  const dow = now.getDay()
  const currentMonday = new Date(now)
  currentMonday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))
  currentMonday.setHours(0, 0, 0, 0)

  // Monday of the viewed week
  const weekMonday = new Date(currentMonday)
  weekMonday.setDate(currentMonday.getDate() + weekOffset * 7)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekMonday)
    d.setDate(weekMonday.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  const weekVals = weekDays.map(d =>
    transactions
      .filter(t => t.type === 'expense' && t.date === d)
      .reduce((a, t) => a + t.amount, 0)
  )
  const maxVal = Math.max(...weekVals, 1)

  const weekEnd = new Date(weekMonday)
  weekEnd.setDate(weekMonday.getDate() + 6)
  const weekLabel =
    weekOffset === 0 ? 'This week' :
    weekOffset === -1 ? 'Last week' :
    `${fmtShort(weekMonday)} – ${fmtShort(weekEnd)}`

  // Day detail
  const dayTxs = transactions.filter(t => t.date === selectedDay)
  const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
  const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)

  const selDateObj = new Date(selectedDay + 'T00:00:00')
  const diffDays = Math.round(
    (new Date(todayStr + 'T00:00:00').getTime() - selDateObj.getTime()) / 86400000
  )
  const dayLabel =
    diffDays === 0 ? 'Today' :
    diffDays === 1 ? 'Yesterday' :
    `${DAY_LABELS[selDateObj.getDay() === 0 ? 6 : selDateObj.getDay() - 1]}, ${fmtShort(selDateObj)}`

  const selectDay = (d: string) => {
    if (d <= todayStr) setSelectedDay(d)
  }

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

      {/* Week chart */}
      <div className="pt-6 pb-6 border-b border-linen">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="text-ash hover:text-char cursor-pointer transition-colors p-1 -ml-1 text-base"
            aria-label="Previous week"
          >
            ←
          </button>
          <div className="text-[9px] tracking-[.16em] uppercase text-ash">{weekLabel}</div>
          <button
            onClick={() => weekOffset < 0 && setWeekOffset(o => o + 1)}
            aria-label="Next week"
            className={`p-1 -mr-1 text-base transition-colors ${
              weekOffset >= 0 ? 'text-silk cursor-default' : 'text-ash hover:text-char cursor-pointer'
            }`}
          >
            →
          </button>
        </div>

        {/* Bars */}
        <div className="grid grid-cols-7 gap-1.5 items-end h-14 mb-2">
          {weekDays.map((d, i) => {
            const isFuture = d > todayStr
            const isSelected = d === selectedDay
            const hasData = weekVals[i] > 0
            const h = !hasData || isFuture ? 2 : Math.max(4, Math.round((weekVals[i] / maxVal) * 48))
            const bg = isFuture ? '#F0EDE9' : isSelected ? '#1C1C1A' : hasData ? '#D6D0C8' : '#EDE9E3'

            return (
              <button
                key={d}
                onClick={() => selectDay(d)}
                disabled={isFuture}
                title={!isFuture && hasData ? fmt(weekVals[i]) : undefined}
                className={`flex flex-col items-center h-14 justify-end w-full ${isFuture ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div
                  className="w-full rounded-sm transition-all duration-300"
                  style={{ height: h, background: bg }}
                />
              </button>
            )
          })}
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1.5">
          {DAY_LABELS.map((l, i) => (
            <button
              key={i}
              onClick={() => selectDay(weekDays[i])}
              disabled={weekDays[i] > todayStr}
              className={`text-center text-[8px] uppercase tracking-[.06em] transition-colors ${
                weekDays[i] === selectedDay
                  ? 'text-char font-medium'
                  : weekDays[i] > todayStr
                  ? 'text-silk cursor-default'
                  : 'text-ash cursor-pointer'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Day detail */}
      <div className="pt-6 pb-6 border-b border-linen">
        <div className="flex items-baseline justify-between mb-4">
          <div className="text-[9px] tracking-[.16em] uppercase text-ash">{dayLabel}</div>
          <div className="flex items-baseline gap-3">
            {dayIncome > 0 && (
              <span className="font-serif text-[14px] text-brand-green">+{fmt(dayIncome)}</span>
            )}
            {dayExpense > 0 && (
              <span className="font-serif text-[14px] text-brand-red">−{fmt(dayExpense)}</span>
            )}
          </div>
        </div>

        {dayTxs.length === 0 ? (
          <div className="py-8 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-4" />
            Nothing on this day
          </div>
        ) : (
          dayTxs.map(t => {
            const isInc = t.type === 'income'
            return (
              <div key={t.id} className="flex items-center py-3 border-b border-linen last:border-none gap-3">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isInc ? 'bg-brand-green' : 'bg-brand-red'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-char truncate">{t.description}</div>
                  <div className="text-[10px] text-ash mt-0.5 tracking-[.04em]">{t.category}</div>
                </div>
                <div className={`font-serif text-[17px] shrink-0 ${isInc ? 'text-brand-green' : 'text-brand-red'}`}>
                  {isInc ? '+' : '−'}{fmt(t.amount)}
                </div>
              </div>
            )
          })
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
    </div>
  )
}
