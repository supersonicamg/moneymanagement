import type { Transaction } from './types'

export const fmt = (n: number): string =>
  '₹' + Math.abs(n).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

export const todayStr = (): string =>
  new Date().toISOString().split('T')[0]

export const mkMonthKey = (y: number, m: number): string =>
  `${y}-${String(m + 1).padStart(2, '0')}`

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const filterByMonth = (txs: Transaction[], year: number, month: number) => {
  const prefix = mkMonthKey(year, month)
  return txs.filter(t => t.date?.startsWith(prefix))
}

export const sumIncome = (txs: Transaction[]): number =>
  txs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)

export const sumExpense = (txs: Transaction[]): number =>
  txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
