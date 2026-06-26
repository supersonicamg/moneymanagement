'use client'

import type { Transaction, Budget, Goal } from '@/lib/types'
import { fmt, filterByMonth } from '@/lib/utils'

interface Props {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  onDeleteBudget: (id: string) => void
  onDeleteGoal: (id: string) => void
  onOpenBudgetSheet: () => void
  onOpenGoalSheet: () => void
  onOpenDepositSheet: (id: string, name: string) => void
}

function BudgetRow({ b, monthTxs, onDelete }: { b: Budget; monthTxs: Transaction[]; onDelete: () => void }) {
  const spent = monthTxs.filter(t => t.type === 'expense' && t.category === b.category)
    .reduce((a, t) => a + t.amount, 0)
  const pct = Math.min(100, Math.round((spent / b.monthly_limit) * 100))
  const over = spent > b.monthly_limit

  return (
    <div className="py-5 border-b border-linen last:border-none">
      <div className="flex justify-between items-baseline mb-2.5">
        <span className="text-[13px] text-char font-normal">{b.category}</span>
        <div className="flex items-center gap-3">
          <span className="font-serif text-[15px] text-ash">
            <b className="font-normal text-char">{fmt(spent)}</b> / {fmt(b.monthly_limit)}
          </span>
          <button
            onClick={onDelete}
            className="text-silk hover:text-brand-red transition-colors cursor-pointer text-sm leading-none p-0.5"
          >
            ×
          </button>
        </div>
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

function GoalRow({ g, onDelete, onDeposit }: { g: Goal; onDelete: () => void; onDeposit: () => void }) {
  const pct = Math.min(100, Math.round(((g.saved || 0) / g.target) * 100))
  const done = (g.saved || 0) >= g.target

  let deadlineText = ''
  if (g.deadline) {
    const dl = new Date(g.deadline)
    const diff = Math.ceil((dl.getTime() - Date.now()) / 86400000)
    deadlineText = diff > 0 ? `${diff} days left` : 'Overdue'
  }

  return (
    <div className="py-5 border-b border-linen last:border-none">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[13px] text-char font-normal">{g.name}</span>
        <span className={`font-serif text-[22px] font-light ${done ? 'text-brand-green' : 'text-ash'}`}>{pct}%</span>
      </div>
      <div className="text-[10px] text-ash tracking-[.04em] mb-2.5">
        <b className="font-normal text-char">{fmt(g.saved || 0)}</b> of {fmt(g.target)}
        {deadlineText && ` · ${deadlineText}`}
      </div>
      <div className="h-px bg-linen relative mb-3">
        <div
          className="absolute top-0 left-0 h-px transition-all duration-700"
          style={{ width: `${pct}%`, background: done ? '#3A6B4A' : '#1C1C1A' }}
        />
      </div>
      <div className="flex gap-3">
        {!done ? (
          <button
            onClick={onDeposit}
            className="border border-silk text-ash text-[10px] tracking-[.12em] uppercase px-4 py-2 hover:border-char hover:text-char transition-all cursor-pointer"
          >
            Add savings
          </button>
        ) : (
          <span className="text-[11px] text-brand-green tracking-[.06em]">REACHED ✓</span>
        )}
        <button
          onClick={onDelete}
          className="border text-brand-red text-[10px] tracking-[.12em] uppercase px-4 py-2 border-[#e8ccc4] hover:bg-brand-red hover:text-stone hover:border-brand-red transition-all cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

export default function PlanScreen({ transactions, budgets, goals, onDeleteBudget, onDeleteGoal, onOpenBudgetSheet, onOpenGoalSheet, onOpenDepositSheet }: Props) {
  const now = new Date()
  const monthTxs = filterByMonth(transactions, now.getFullYear(), now.getMonth())

  return (
    <div>
      <div className="pt-12 pb-8 border-b border-linen mb-0">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-2">Plan</div>
        <h1 className="font-serif text-[36px] font-light leading-none tracking-[-0.01em] text-ink">Budgets &amp; Goals</h1>
      </div>

      {/* Budgets */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-0">Monthly budgets</div>
        {budgets.length === 0 ? (
          <div className="py-12 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No budgets yet
          </div>
        ) : (
          budgets.map(b => (
            <BudgetRow key={b.id} b={b} monthTxs={monthTxs} onDelete={() => onDeleteBudget(b.id)} />
          ))
        )}
        <div className="mt-4 mb-9">
          <button
            onClick={onOpenBudgetSheet}
            className="border border-silk text-ash text-[10px] tracking-[.12em] uppercase px-4 py-2 hover:border-char hover:text-char transition-all cursor-pointer"
          >
            Add budget
          </button>
        </div>
      </div>

      {/* Goals */}
      <div className="pt-0 border-t border-linen">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-0 pt-7">Savings goals</div>
        {goals.length === 0 ? (
          <div className="py-12 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No goals yet
          </div>
        ) : (
          goals.map(g => (
            <GoalRow
              key={g.id}
              g={g}
              onDelete={() => onDeleteGoal(g.id)}
              onDeposit={() => onOpenDepositSheet(g.id, g.name)}
            />
          ))
        )}
        <div className="mt-4">
          <button
            onClick={onOpenGoalSheet}
            className="border border-silk text-ash text-[10px] tracking-[.12em] uppercase px-4 py-2 hover:border-char hover:text-char transition-all cursor-pointer"
          >
            Add goal
          </button>
        </div>
      </div>
    </div>
  )
}
