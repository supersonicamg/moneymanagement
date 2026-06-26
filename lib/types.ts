export type TxType = 'income' | 'expense'

export const CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Health',
  'Entertainment', 'Shopping', 'Education',
  'Travel', 'Salary', 'Freelance', 'Investment', 'Other',
] as const

export const BUDGET_CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Health',
  'Entertainment', 'Shopping', 'Education', 'Travel', 'Other',
] as const

export interface Transaction {
  id: string
  type: TxType
  amount: number
  description: string
  category: string
  date: string
  note?: string
  created_at?: string
}

export interface Budget {
  id: string
  category: string
  monthly_limit: number
  created_at?: string
}

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  deadline?: string
  created_at?: string
}

export type Screen = 'home' | 'log' | 'plan' | 'insights'
