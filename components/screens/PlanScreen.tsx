'use client'

import { useAppData } from '@/lib/DataContext'
import { fmt, filterByMonth } from '@/lib/utils'

function BudgetCard({
  b,
  spent,
  onDelete,
}: {
  b: { id: string; category: string; monthly_limit: number }
  spent: number
  onDelete: () => void
}) {
  const pct = Math.min(100, Math.round((spent / b.monthly_limit) * 100))
  const over = spent > b.monthly_limit
  const warn = !over && pct >= 75

  let barColor = '#3A6B4A'
  let statusColor = '#9B958D'
  if (over) { barColor = '#C1440E'; statusColor = '#C1440E' }
  else if (warn) { barColor = '#C17A0E'; statusColor = '#C17A0E' }

  return (
    <div className="border border-linen p-4 group relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            {over && <span className="text-[9px] text-brand-red tracking-[.08em] uppercase">Over</span>}
            {warn && !over && <span className="text-[9px] tracking-[.08em] uppercase" style={{ color: '#C17A0E' }}>Near limit</span>}
          </div>
          <div className="text-[14px] text-char">{b.category}</div>
        </div>
        <button
          onClick={onDelete}
          className="text-silk hover:text-brand-red transition-colors cursor-pointer text-sm p-1 -mr-1 -mt-1 opacity-0 group-hover:opacity-100"
          aria-label="Remove budget"
        >
          ×
        </button>
      </div>

      <div className="h-[3px] bg-linen rounded-full relative mb-2">
        <div
          className="absolute top-0 left-0 h-[3px] rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      <div className="flex justify-between items-baseline">
        <span className="font-serif text-[13px]" style={{ color: statusColor }}>
          {fmt(spent)}
          <span className="text-ash font-sans text-[10px]"> / {fmt(b.monthly_limit)}</span>
        </span>
        <span className="text-[10px]" style={{ color: statusColor }}>
          {over
            ? `+${fmt(spent - b.monthly_limit)} over`
            : `${fmt(b.monthly_limit - spent)} left`}
        </span>
      </div>
    </div>
  )
}

function GoalCard({
  g,
  onDelete,
  onDeposit,
}: {
  g: { id: string; name: string; target: number; saved: number; deadline?: string }
  onDelete: () => void
  onDeposit: () => void
}) {
  const saved = g.saved || 0
  const pct = Math.min(100, Math.round((saved / g.target) * 100))
  const done = saved >= g.target

  let deadlineBadge = ''
  if (g.deadline && !done) {
    const diff = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000)
    deadlineBadge = diff > 0 ? `${diff}d left` : 'Overdue'
  }

  return (
    <div className="border border-linen p-4">
      <div className="flex items-start justify-between mb-1">
        <div className="text-[14px] text-char flex-1 min-w-0 pr-2">{g.name}</div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {deadlineBadge && (
            <span className={`text-[9px] tracking-[.06em] ${deadlineBadge === 'Overdue' ? 'text-brand-red' : 'text-ash'}`}>
              {deadlineBadge}
            </span>
          )}
          {done && (
            <span className="text-[9px] text-brand-green tracking-[.06em]">Done ✓</span>
          )}
          <span className="font-serif text-[20px] font-light text-ash">{pct}%</span>
        </div>
      </div>

      <div className="text-[10px] text-ash mb-3 tracking-[.03em]">
        <span className="text-char">{fmt(saved)}</span> of {fmt(g.target)}
      </div>

      <div className="h-[3px] bg-linen rounded-full relative mb-4">
        <div
          className="absolute top-0 left-0 h-[3px] rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: done ? '#3A6B4A' : '#1C1C1A' }}
        />
      </div>

      <div className="flex gap-2">
        {!done && (
          <button
            onClick={onDeposit}
            className="border border-silk text-ash text-[10px] tracking-[.1em] uppercase px-4 py-2 hover:border-char hover:text-char transition-all cursor-pointer"
          >
            Add savings
          </button>
        )}
        <button
          onClick={onDelete}
          className="border text-brand-red text-[10px] tracking-[.1em] uppercase px-4 py-2 border-[#e8ccc4] hover:bg-brand-red hover:text-stone hover:border-brand-red transition-all cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

export default function PlanScreen() {
  const {
    transactions: rawTransactions, budgets, goals,
    deleteBudget, deleteGoal,
    openBudget, openGoal, openDeposit,
    showToast,
  } = useAppData()
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : []

  const now = new Date()
  const monthTxs = filterByMonth(transactions, now.getFullYear(), now.getMonth())

  const budgetData = budgets.map(b => {
    const spent = monthTxs
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((a, t) => a + t.amount, 0)
    return { ...b, spent }
  })

  const totalAllocated = budgets.reduce((a, b) => a + b.monthly_limit, 0)
  const totalSpent = budgetData.reduce((a, b) => a + b.spent, 0)
  const totalPct = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0
  const totalOver = totalSpent > totalAllocated

  return (
    <div>
      {/* Header */}
      <div className="pt-12 pb-8 border-b border-linen">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-2">Plan</div>
        <h1 className="font-serif text-[36px] font-light leading-none tracking-[-0.01em] text-ink">
          Budgets &amp; Goals
        </h1>
      </div>

      {/* Budgets section */}
      <div className="pt-7">
        <div className="flex items-baseline justify-between mb-4">
          <div className="text-[9px] tracking-[.16em] uppercase text-ash">Monthly budgets</div>
          {budgets.length > 0 && (
            <span className={`text-[10px] ${totalOver ? 'text-brand-red' : 'text-ash'}`}>
              {fmt(totalSpent)} / {fmt(totalAllocated)}
            </span>
          )}
        </div>

        {budgets.length > 0 && (
          <div className="mb-5">
            <div className="h-[3px] bg-linen rounded-full relative mb-1.5">
              <div
                className="absolute top-0 left-0 h-[3px] rounded-full transition-all duration-700"
                style={{ width: `${totalPct}%`, background: totalOver ? '#C1440E' : '#3A6B4A' }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] text-ash">{totalPct}% of total budget used</span>
              <span className={`text-[9px] ${totalOver ? 'text-brand-red' : 'text-ash'}`}>
                {totalOver ? `over by ${fmt(totalSpent - totalAllocated)}` : `${fmt(totalAllocated - totalSpent)} remaining`}
              </span>
            </div>
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="py-10 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No budgets yet
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {budgetData
              .sort((a, b) => b.spent / b.monthly_limit - a.spent / a.monthly_limit)
              .map(b => (
                <BudgetCard
                  key={b.id}
                  b={b}
                  spent={b.spent}
                  onDelete={async () => { await deleteBudget(b.id); showToast('Budget removed') }}
                />
              ))}
          </div>
        )}

        <div className="mt-5 mb-2">
          <button
            onClick={openBudget}
            className="border border-silk text-ash text-[10px] tracking-[.1em] uppercase px-4 py-2.5 hover:border-char hover:text-char transition-all cursor-pointer"
          >
            + Set budget
          </button>
        </div>
      </div>

      {/* Goals section */}
      <div className="pt-7 border-t border-linen mt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-4">Savings goals</div>

        {goals.length === 0 ? (
          <div className="py-10 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No goals yet
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map(g => (
              <GoalCard
                key={g.id}
                g={g}
                onDelete={async () => { await deleteGoal(g.id); showToast('Goal removed') }}
                onDeposit={() => openDeposit(g.id, g.name)}
              />
            ))}
          </div>
        )}

        <div className="mt-5">
          <button
            onClick={openGoal}
            className="border border-silk text-ash text-[10px] tracking-[.1em] uppercase px-4 py-2.5 hover:border-char hover:text-char transition-all cursor-pointer"
          >
            + New goal
          </button>
        </div>
      </div>
    </div>
  )
}
