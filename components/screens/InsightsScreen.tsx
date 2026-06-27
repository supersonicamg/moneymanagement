'use client'

import { useAppData } from '@/lib/DataContext'
import { fmt, filterByMonth, sumIncome, sumExpense, MONTH_NAMES } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#C17A0E',
  Transport: '#0E6EC1',
  Housing: '#6B3A9B',
  Health: '#C1440E',
  Entertainment: '#0E9B6B',
  Shopping: '#9B0E6B',
  Education: '#3A6B4A',
  Travel: '#6B9B0E',
  Salary: '#3A6B4A',
  Freelance: '#6B4A3A',
  Investment: '#0E3A6B',
  Other: '#9B958D',
}

function TrendChart({ data }: { data: { label: string; inc: number; exp: number }[] }) {
  if (data.length < 2) return null
  const W = 360
  const H = 130
  const padL = 8
  const padR = 8
  const padT = 12
  const padB = 26
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const maxVal = Math.max(...data.flatMap(d => [d.inc, d.exp]), 1)

  const px = (i: number) => padL + (i / (data.length - 1)) * chartW
  const py = (v: number) => padT + chartH - (v / maxVal) * chartH
  const bot = padT + chartH

  const incPts = data.map((d, i) => `${px(i).toFixed(1)},${py(d.inc).toFixed(1)}`).join(' ')
  const expPts = data.map((d, i) => `${px(i).toFixed(1)},${py(d.exp).toFixed(1)}`).join(' ')
  const incArea = `${px(0).toFixed(1)},${bot} ${incPts} ${px(data.length - 1).toFixed(1)},${bot}`
  const expArea = `${px(0).toFixed(1)},${bot} ${expPts} ${px(data.length - 1).toFixed(1)},${bot}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <line x1={padL} y1={bot} x2={W - padR} y2={bot} stroke="#EDE9E3" strokeWidth={0.5} />
      <polygon points={expArea} fill="#C1440E" fillOpacity={0.07} />
      <polyline points={expPts} fill="none" stroke="#C1440E" strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={incArea} fill="#3A6B4A" fillOpacity={0.1} />
      <polyline points={incPts} fill="none" stroke="#3A6B4A" strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const show = data.length <= 8 || i % 2 === 0 || i === data.length - 1
        return show ? (
          <text key={i} x={px(i)} y={H - 5} textAnchor="middle" fontSize={7} fill="#9B958D">
            {d.label}
          </text>
        ) : null
      })}
    </svg>
  )
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex-1 border border-linen p-4">
      <div className="font-serif text-[22px] font-light text-ink leading-none">{value}</div>
      {sub && <div className="text-[9px] text-brand-green mt-0.5 tracking-[.04em]">{sub}</div>}
      <div className="text-[9px] tracking-[.1em] uppercase text-ash mt-2">{label}</div>
    </div>
  )
}

export default function InsightsScreen() {
  const { transactions: rawTransactions } = useAppData()
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : []

  const now = new Date()
  const curMonthTxs = filterByMonth(transactions, now.getFullYear(), now.getMonth())
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthTxs = filterByMonth(transactions, prevMonthDate.getFullYear(), prevMonthDate.getMonth())

  const curExp = sumExpense(curMonthTxs)
  const prevExp = sumExpense(prevMonthTxs)
  const curInc = sumIncome(curMonthTxs)

  const allInc = sumIncome(transactions)
  const allExp = sumExpense(transactions)
  const allNet = allInc - allExp

  // Savings rate this month
  const savingsRate = curInc > 0 ? Math.round(((curInc - curExp) / curInc) * 100) : 0

  // Month-over-month change
  const momChange = prevExp > 0
    ? Math.round(((curExp - prevExp) / prevExp) * 100)
    : null

  // Average daily spend this month
  const daysElapsed = Math.max(1, now.getDate())
  const avgDaily = Math.round(curExp / daysElapsed)

  // Category breakdown this month
  const catTotals: Record<string, number> = {}
  curMonthTxs.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount
  })
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1])
  const maxCat = Math.max(...sortedCats.map(([, v]) => v), 1)
  const topCategory = sortedCats[0]?.[0] ?? '—'

  // 12-month trend
  const months12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return {
      y: d.getFullYear(),
      m: d.getMonth(),
      label: MONTH_NAMES[d.getMonth()].slice(0, 3),
    }
  })
  const trend = months12.map(({ y, m, label }) => {
    const list = filterByMonth(transactions, y, m)
    return { label, inc: sumIncome(list), exp: sumExpense(list) }
  })

  return (
    <div>
      {/* Header */}
      <div className="pt-12 pb-8 border-b border-linen">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash mb-2">Analysis</div>
        <h1 className="font-serif text-[36px] font-light leading-none tracking-[-0.01em] text-ink">Insights</h1>
      </div>

      {/* Key metrics */}
      <div className="pt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-3">This month</div>
        <div className="flex gap-3">
          <MetricTile
            label="Avg / day"
            value={fmt(avgDaily)}
          />
          <MetricTile
            label="Savings rate"
            value={`${savingsRate}%`}
            sub={savingsRate >= 20 ? 'on track' : savingsRate >= 0 ? 'low' : undefined}
          />
          <MetricTile
            label="Top category"
            value={topCategory}
          />
        </div>
        {momChange !== null && (
          <div className={`mt-3 text-[11px] tracking-[.03em] ${momChange > 0 ? 'text-brand-red' : 'text-brand-green'}`}>
            {momChange > 0 ? '▲' : '▼'} {Math.abs(momChange)}% vs last month
          </div>
        )}
      </div>

      {/* 12-month trend chart */}
      <div className="pt-7 border-t border-linen mt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-1">Income vs Expense</div>
        <div className="text-[9px] text-ash mb-4">12-month view</div>
        {trend.every(t => t.inc === 0 && t.exp === 0) ? (
          <div className="py-10 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No data yet
          </div>
        ) : (
          <>
            <TrendChart data={trend} />
            <div className="flex gap-5 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-px" style={{ background: '#3A6B4A' }} />
                <span className="text-[9px] text-ash">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-px" style={{ background: '#C1440E' }} />
                <span className="text-[9px] text-ash">Expense</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Category breakdown */}
      <div className="pt-7 border-t border-linen mt-7">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-1">Spending by category</div>
        <div className="text-[9px] text-ash mb-5">{MONTH_NAMES[now.getMonth()]}</div>
        {sortedCats.length === 0 ? (
          <div className="py-10 text-center text-ash text-[12px] tracking-[.06em]">
            <div className="w-8 h-px bg-silk mx-auto mb-5" />
            No expenses this month
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedCats.map(([cat, amt]) => {
              const pct = Math.round((amt / maxCat) * 100)
              const color = CATEGORY_COLORS[cat] ?? '#9B958D'
              return (
                <div key={cat}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-[12px] text-char">{cat}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[9px] text-ash">{pct}%</span>
                      <span className="font-serif text-[14px] text-char">{fmt(amt)}</span>
                    </div>
                  </div>
                  <div className="h-1 bg-linen rounded-full relative">
                    <div
                      className="absolute top-0 left-0 h-1 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* All-time summary */}
      <div className="pt-7 border-t border-linen mt-7 mb-4">
        <div className="text-[9px] tracking-[.16em] uppercase text-ash mb-0">All time</div>
        {[
          { label: 'Total income', value: fmt(allInc), color: 'text-brand-green' },
          { label: 'Total expense', value: fmt(allExp), color: 'text-brand-red' },
          { label: 'Net balance', value: (allNet < 0 ? '−' : '') + fmt(Math.abs(allNet)), color: allNet < 0 ? 'text-brand-red' : 'text-char' },
          { label: 'Transactions', value: String(transactions.length), color: 'text-char' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-baseline py-3.5 border-b border-linen last:border-none gap-4">
            <span className="text-[11px] text-ash tracking-[.06em] flex-1">{label}</span>
            <span className={`font-serif text-[22px] font-normal ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
