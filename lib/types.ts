export type TxType = 'income' | 'expense' | 'transfer'
export type AccountType = 'cash' | 'bank' | 'credit' | 'savings' | 'investment' | 'other'
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

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
  user_id?: string
  account_id?: string
  recurring_id?: string
  type: TxType
  amount: number
  description: string
  category: string
  tags?: string[]
  date: string
  note?: string
  created_at?: string
}

export interface Budget {
  id: string
  user_id?: string
  category: string
  monthly_limit: number
  rollover?: boolean
  created_at?: string
}

export interface Goal {
  id: string
  user_id?: string
  account_id?: string
  name: string
  target: number
  saved: number
  deadline?: string
  color?: string
  icon?: string
  created_at?: string
}

export interface Account {
  id: string
  user_id?: string
  name: string
  type: AccountType
  balance: number
  color?: string
  is_default?: boolean
  created_at?: string
}

export interface RecurringTransaction {
  id: string
  user_id?: string
  account_id?: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  frequency: RecurringFrequency
  next_due: string
  is_active: boolean
  created_at?: string
}

export interface Profile {
  id: string
  display_name?: string
  currency: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export type Screen = 'home' | 'log' | 'plan' | 'insights' | 'profile'
