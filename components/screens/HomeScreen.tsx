'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppData } from '@/lib/DataContext'
import { fmt, filterByMonth, sumIncome, sumExpense, MONTH_NAMES } from '@/lib/utils'
import type { Goal } from '@/lib/types'

function mixWithWhite(hex: string, ratio: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const m = (c: number) => Math.round(255 + (c - 255) * ratio)
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`
}

// Lighter tints of the brand accents, legible on the dark hero card.
const HERO_GREEN = mixWithWhite('#3A6B4A', 0.45)
const HERO_RED = mixWithWhite('#C1440E', 0.4)

function heatColor(net: number, maxAbs: number): string {
  const ratio = Math.min(1, Math.abs(net) / maxAbs)
  const level = ratio > 0.66 ? 0.85 : ratio > 0.33 ? 0.55 : 0.3
  return mixWithWhite(net >= 0 ? '#3A6B4A' : '#C1440E', level)
}

function greetingFor(hour: number): string {
  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`border border-linen p-5 sm:p-6 ${className}`}>{children}</div>
}

function SectionHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <div className="text-[9px] tracking-[.16em] uppercase text-ash">{label}</div>
      {action}
    </div>
  )
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link href={href} className="text-[9px] tracking-[.1em] uppercase text-ash hover:text-char transition-colors">
      See all →
    </Link>
  )
}

function QuickActions({
  onAdd, onBudget, onGoal, onBalance,
}: {
  onAdd: () => void
  onBudget: () => void
  onGoal: () => void
  onBalance: () => void
}) {
  const items = [
    { label: 'Add entry', onClick: onAdd },
    { label: 'Set budget', onClick: onBudget },
    { label: 'New goal', onClick: onGoal },
    { label: 'Edit balance', onClick: onBalance },
  ]
  return (
    <Card>
      <SectionHeader label="Quick actions" />
      <div className="grid grid-cols-2 gap-2">
        {items.map(it => (
          <button
            key={it.label}
            onClick={it.onClick}
            className="border border-silk text-ash text-[10px] tracking-[.1em] uppercase py-3.5 hover:border-char hover:text-char active:bg-linen transition-all cursor-pointer"
          >
            {it.label}
          </button>
        ))}
      </div>
    </Card>
  )
}

function GoalsPreview({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) return null
  const top = [...goals]
    .map(g => ({ ...g, pct: (g.saved || 0) / g.target }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2)

  return (
    <Card>
      <SectionHeader label="Savings goals" action={<SeeAll href="/plan" />} />
      <div className="flex flex-col gap-4">
        {top.map(g => {
          const saved = g.saved || 0
          const pct = Math.min(100, Math.round((saved / g.target) * 100))
          const done = saved >= g.target
          return (
            <div key={g.id}>
              <div className="flex justify-between items-baseline mb-1.5 gap-2">
                <span className="text-[12px] text-char truncate">{g.name}</span>
                <span className="font-serif text-[14px] text-ash shrink-0">{pct}%</span>
              </div>
              <div className="h-0.75 bg-linen rounded-full">
                <div
                  className="h-0.75 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: done ? '#3A6B4A' : '#1C1C1A' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
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

const pad2 = (n: number) => String(n).padStart(2, '0')

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function HomeScreen() {
  const { transactions: rawTransactions, budgets, goals, profile, openBalance, openAdd, openBudget, openGoal } = useAppData()
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : []

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const monthTxs = filterByMonth(transactions, y, m)
  const income = sumIncome(monthTxs)
  const expense = sumExpense(monthTxs)
  const runningBalance = (profile?.starting_balance ?? 0) + sumIncome(transactions) - sumExpense(transactions)
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : null

  const todayStr = now.toISOString().split('T')[0]
  const greeting = greetingFor(now.getHours())
  const firstName = profile?.display_name?.trim().split(' ')[0]
  const fullDateLabel = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
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

  const weekIncome = weekDays.map(d =>
    transactions
      .filter(t => t.type === 'income' && t.date === d)
      .reduce((a, t) => a + t.amount, 0)
  )
  const weekExpense = weekDays.map(d =>
    transactions
      .filter(t => t.type === 'expense' && t.date === d)
      .reduce((a, t) => a + t.amount, 0)
  )
  const weekTotals = weekDays.map((_, i) => weekIncome[i] + weekExpense[i])
  const maxTotal = Math.max(...weekTotals, 1)

  const weekEnd = new Date(weekMonday)
  weekEnd.setDate(weekMonday.getDate() + 6)
  const weekLabel =
    weekOffset === 0 ? 'This week' :
    weekOffset === -1 ? 'Last week' :
    `${fmtShort(weekMonday)} – ${fmtShort(weekEnd)}`

  // Month heatmap
  const viewedMonthDate = new Date(y, m + monthOffset, 1)
  const vy = viewedMonthDate.getFullYear()
  const vm = viewedMonthDate.getMonth()
  const monthLabel =
    monthOffset === 0 ? 'This month' :
    monthOffset === -1 ? 'Last month' :
    `${MONTH_NAMES[vm]} ${vy}`

  const daysInMonth = new Date(vy, vm + 1, 0).getDate()
  const leadingBlanks = (new Date(vy, vm, 1).getDay() + 6) % 7

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = `${vy}-${pad2(vm + 1)}-${pad2(day)}`
    const dayTxsAll = transactions.filter(t => t.date === date)
    const inc = dayTxsAll.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
    const exp = dayTxsAll.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
    return { date, net: inc - exp, hasData: inc > 0 || exp > 0, future: date > todayStr }
  })
  const maxAbsNet = Math.max(...monthDays.filter(d => d.hasData).map(d => Math.abs(d.net)), 1)
  const heatCells: Array<null | { date: string; color: string; hasData: boolean; future: boolean; net: number }> = [
    ...Array(leadingBlanks).fill(null),
    ...monthDays.map(d => ({
      ...d,
      color: d.future ? '#F7F5F2' : !d.hasData ? '#EDE9E3' : heatColor(d.net, maxAbsNet),
    })),
  ]

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

  const openingBalance = (profile?.starting_balance ?? 0) +
    sumIncome(transactions.filter(t => t.date < selectedDay)) -
    sumExpense(transactions.filter(t => t.date < selectedDay))
  const balanceDelta = runningBalance - openingBalance

  const dayByCategory = Object.values(
    dayTxs.reduce((acc, t) => {
      const key = `${t.category}-${t.type}`
      if (!acc[key]) acc[key] = { category: t.category, type: t.type, amount: 0 }
      acc[key].amount += t.amount
      return acc
    }, {} as Record<string, { category: string; type: string; amount: number }>)
  ).sort((a, b) => b.amount - a.amount)
  const maxCatAmt = Math.max(...dayByCategory.map(c => c.amount), 1)
  const dayByTx = [...dayTxs].sort((a, b) => b.amount - a.amount)
  const maxTxAmt = Math.max(...dayByTx.map(t => t.amount), 1)

  const selectDay = (d: string) => {
    if (d <= todayStr) setSelectedDay(d)
  }

  return (
    <div>
      {/* Greeting */}
      <div className="pt-8 md:pt-10 pb-6">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-1.5">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </div>
        <div className="font-serif text-[15px] text-char">{fullDateLabel}</div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:items-start">
        {/* ── Main column ─────────────────────────── */}
        <div className="min-w-0 flex flex-col gap-6">
          {/* Balance hero */}
          <div className="bg-ink text-stone p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] tracking-[.18em] uppercase text-stone/55">Balance</span>
              <button
                onClick={openBalance}
                aria-label="Edit balance"
                className="text-stone/55 hover:text-stone transition-colors cursor-pointer text-[11px] leading-none p-1 -m-1"
              >
                ✎
              </button>
            </div>
            <div
              className="font-light leading-none tracking-[-0.02em] mb-2"
              style={{
                fontSize: 'clamp(2.25rem, 8vw, 4rem)',
                color: runningBalance < 0 ? HERO_RED : '#FAF9F7',
              }}
            >
              {runningBalance < 0 ? '−' : ''}{fmt(runningBalance)}
            </div>
            <div className="text-[9px] tracking-[.14em] uppercase text-stone/45 mb-6">
              {MONTH_NAMES[m]} {y}
            </div>
            <div className="flex items-stretch">
              <div className="flex flex-col pr-5">
                <span className="text-[13px] font-medium" style={{ color: HERO_GREEN }}>{fmt(income)}</span>
                <span className="text-[9px] tracking-widest uppercase text-stone/45 mt-0.5">Income</span>
              </div>
              <div className="w-px self-stretch" style={{ background: 'rgba(247,245,242,0.16)' }} />
              <div className="flex flex-col px-5">
                <span className="text-[13px] font-medium" style={{ color: HERO_RED }}>{fmt(expense)}</span>
                <span className="text-[9px] tracking-widest uppercase text-stone/45 mt-0.5">Spent</span>
              </div>
              {savingsRate !== null && (
                <>
                  <div className="w-px self-stretch" style={{ background: 'rgba(247,245,242,0.16)' }} />
                  <div className="flex flex-col items-center px-5">
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: savingsRate >= 20 ? HERO_GREEN : savingsRate >= 0 ? 'rgba(247,245,242,0.7)' : HERO_RED }}
                    >
                      {savingsRate}%
                    </span>
                    <span className="text-[9px] tracking-widest uppercase text-stone/45 mt-0.5">Saved</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Activity chart */}
          <Card>
            {/* View tabs */}
            <div className="flex items-center gap-5 mb-5">
              {(['day', 'week', 'month'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`text-[9px] tracking-[.16em] uppercase py-1 border-b transition-colors cursor-pointer ${
                    view === v ? 'text-char border-char' : 'text-ash border-transparent hover:text-char'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => {
                  if (view === 'day') setSelectedDay(d => shiftDate(d, -1))
                  else if (view === 'week') setWeekOffset(o => o - 1)
                  else setMonthOffset(o => o - 1)
                }}
                className="text-ash hover:text-char cursor-pointer transition-colors p-2 -ml-2 text-base rounded-full hover:bg-linen/60"
                aria-label="Previous"
              >
                ←
              </button>
              <div className="text-[9px] tracking-[.16em] uppercase text-ash">
                {view === 'day' ? dayLabel : view === 'week' ? weekLabel : monthLabel}
              </div>
              <button
                onClick={() => {
                  if (view === 'day') { if (selectedDay < todayStr) setSelectedDay(d => shiftDate(d, 1)) }
                  else if (view === 'week') { if (weekOffset < 0) setWeekOffset(o => o + 1) }
                  else { if (monthOffset < 0) setMonthOffset(o => o + 1) }
                }}
                aria-label="Next"
                className={`p-2 -mr-2 text-base rounded-full transition-colors ${
                  (view === 'day' ? selectedDay >= todayStr : (view === 'week' ? weekOffset : monthOffset) >= 0)
                    ? 'text-silk cursor-default'
                    : 'text-ash hover:text-char hover:bg-linen/60 cursor-pointer'
                }`}
              >
                →
              </button>
            </div>

            {view === 'day' ? (
              <>
                {/* Breakdown for the selected day */}
                {dayByCategory.length === 0 ? (
                  <div className="py-8 text-center text-ash text-[12px] tracking-[.06em]">
                    <div className="w-8 h-px bg-silk mx-auto mb-4" />
                    Nothing on this day
                  </div>
                ) : (
                  <>
                    <div className="text-[8px] tracking-[.14em] uppercase text-ash mb-3">By category</div>
                    <div className="space-y-3">
                      {dayByCategory.map(c => (
                        <div key={`${c.category}-${c.type}`}>
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[12px] text-char">{c.category}</span>
                            <span
                              className={`text-[12px] font-medium ${
                                c.type === 'income' ? 'text-brand-green' : 'text-brand-red'
                              }`}
                            >
                              {c.type === 'income' ? '+' : '−'}{fmt(c.amount)}
                            </span>
                          </div>
                          <div className="h-0.75 bg-linen rounded-full">
                            <div
                              className="h-0.75 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(4, Math.round((c.amount / maxCatAmt) * 100))}%`,
                                background: c.type === 'income' ? '#3A6B4A' : '#C1440E',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[8px] tracking-[.14em] uppercase text-ash mb-3 mt-6">By transaction</div>
                    <div className="space-y-3">
                      {dayByTx.map(t => {
                        const isInc = t.type === 'income'
                        return (
                          <div key={t.id}>
                            <div className="flex justify-between items-baseline mb-1 gap-3">
                              <span className="text-[12px] text-char truncate">{t.description}</span>
                              <span
                                className={`text-[12px] font-medium shrink-0 ${
                                  isInc ? 'text-brand-green' : 'text-brand-red'
                                }`}
                              >
                                {isInc ? '+' : '−'}{fmt(t.amount)}
                              </span>
                            </div>
                            <div className="h-0.75 bg-linen rounded-full">
                              <div
                                className="h-0.75 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(4, Math.round((t.amount / maxTxAmt) * 100))}%`,
                                  background: isInc ? '#3A6B4A' : '#C1440E',
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                {/* Day opening vs current balance */}
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-linen">
                  <div className="flex flex-col">
                    <span className="text-[8px] tracking-[.14em] uppercase text-ash mb-1">Day opening</span>
                    <span className="font-serif text-[16px] text-char">
                      {openingBalance < 0 ? '−' : ''}{fmt(openingBalance)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center px-3">
                    <span
                      className={`text-[11px] font-medium ${
                        balanceDelta < 0 ? 'text-brand-red' : balanceDelta > 0 ? 'text-brand-green' : 'text-ash'
                      }`}
                    >
                      {balanceDelta === 0 ? '—' : `${balanceDelta < 0 ? '−' : '+'}${fmt(balanceDelta)}`}
                    </span>
                    <span className="text-ash text-xs mt-0.5">→</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] tracking-[.14em] uppercase text-ash mb-1">Now</span>
                    <span className="font-serif text-[16px] text-char">
                      {runningBalance < 0 ? '−' : ''}{fmt(runningBalance)}
                    </span>
                  </div>
                </div>
              </>
            ) : view === 'week' ? (
              <>
                {/* Bars: income (green) stacked above expense (red) */}
                <div className="grid grid-cols-7 gap-1.5 items-end h-14 mb-2">
                  {weekDays.map((d, i) => {
                    const isFuture = d > todayStr
                    const isSelected = d === selectedDay
                    const inc = weekIncome[i]
                    const exp = weekExpense[i]
                    const total = inc + exp
                    const hasData = total > 0
                    const totalH = isFuture || !hasData ? 0 : Math.max(4, Math.round((total / maxTotal) * 48))
                    const incH = hasData ? Math.round((inc / total) * totalH) : 0
                    const expH = Math.max(0, totalH - incH)
                    const title = hasData
                      ? [inc > 0 ? `+${fmt(inc)}` : '', exp > 0 ? `−${fmt(exp)}` : ''].filter(Boolean).join('  ')
                      : undefined

                    return (
                      <button
                        key={d}
                        onClick={() => selectDay(d)}
                        disabled={isFuture}
                        title={title}
                        className={`flex flex-col items-center justify-end h-14 w-full rounded-sm transition-colors ${
                          isFuture ? 'cursor-default' : 'cursor-pointer'
                        } ${isSelected ? 'bg-linen/70' : ''}`}
                      >
                        {hasData && !isFuture ? (
                          <div className="w-full flex flex-col-reverse" style={{ height: totalH }}>
                            <div className="w-full rounded-b-sm" style={{ height: expH, background: '#C1440E' }} />
                            <div className="w-full rounded-t-sm" style={{ height: incH, background: '#3A6B4A' }} />
                          </div>
                        ) : (
                          <div
                            className="w-full rounded-sm"
                            style={{ height: 2, background: isFuture ? '#F0EDE9' : '#EDE9E3' }}
                          />
                        )}
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
              </>
            ) : (
              <>
                {/* Heatmap */}
                <div className="grid grid-cols-7 gap-1 mb-1.5">
                  {DAY_LABELS.map((l, i) => (
                    <div key={i} className="text-center text-[8px] uppercase tracking-[.06em] text-ash">
                      {l}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {heatCells.map((cell, i) =>
                    cell ? (
                      <button
                        key={cell.date}
                        onClick={() => selectDay(cell.date)}
                        disabled={cell.future}
                        title={
                          cell.hasData
                            ? `${fmtShort(new Date(cell.date + 'T00:00:00'))}  ${cell.net >= 0 ? '+' : '−'}${fmt(cell.net)}`
                            : undefined
                        }
                        className={`aspect-square rounded-sm transition-colors ${
                          cell.date === selectedDay ? 'ring-1 ring-char' : ''
                        } ${cell.future ? 'cursor-default' : 'cursor-pointer'}`}
                        style={{ background: cell.color }}
                      />
                    ) : (
                      <div key={`b${i}`} />
                    )
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-1 mt-3">
                  <span className="text-[8px] text-ash uppercase tracking-[.06em] mr-1">Spent</span>
                  {[0.85, 0.55, 0.3].map(l => (
                    <div key={`r${l}`} className="w-2 h-2 rounded-sm" style={{ background: mixWithWhite('#C1440E', l) }} />
                  ))}
                  <div className="w-2 h-2 rounded-sm" style={{ background: '#EDE9E3' }} />
                  {[0.3, 0.55, 0.85].map(l => (
                    <div key={`g${l}`} className="w-2 h-2 rounded-sm" style={{ background: mixWithWhite('#3A6B4A', l) }} />
                  ))}
                  <span className="text-[8px] text-ash uppercase tracking-[.06em] ml-1">Saved</span>
                </div>
              </>
            )}
          </Card>

          {/* Day detail */}
          <Card>
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
          </Card>
        </div>

        {/* ── Side column ─────────────────────────── */}
        <div className="flex flex-col gap-6 mt-6 lg:mt-0">
          <QuickActions onAdd={openAdd} onBudget={openBudget} onGoal={openGoal} onBalance={openBalance} />

          <Card>
            <SectionHeader label="Budgets" action={budgets.length > 0 ? <SeeAll href="/plan" /> : undefined} />
            {budgets.length === 0 ? (
              <div className="py-8 text-center text-ash text-[12px] tracking-[.06em]">
                <div className="w-8 h-px bg-silk mx-auto mb-4" />
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
          </Card>

          <GoalsPreview goals={goals} />
        </div>
      </div>
    </div>
  )
}
