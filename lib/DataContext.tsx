'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useData } from '@/hooks/useData'
import type { Transaction } from '@/lib/types'

interface SheetState {
  addOpen: boolean
  editOpen: boolean
  editTx: Transaction | null
  budgetOpen: boolean
  goalOpen: boolean
  depositOpen: boolean
  depositTarget: { id: string; name: string }
  balanceOpen: boolean
}

type DataHook = ReturnType<typeof useData>

interface DataContextValue extends DataHook {
  toast: { msg: string; visible: boolean }
  showToast: (msg: string) => void
  sheets: SheetState
  openAdd: () => void
  closeAdd: () => void
  openEdit: (tx: Transaction) => void
  closeEdit: () => void
  openBudget: () => void
  closeBudget: () => void
  openGoal: () => void
  closeGoal: () => void
  openDeposit: (id: string, name: string) => void
  closeDeposit: () => void
  openBalance: () => void
  closeBalance: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

function AppDataProvider({ children }: { children: ReactNode }) {
  const data = useData()
  const [toast, setToast] = useState({ msg: '', visible: false })
  const [sheets, setSheets] = useState<SheetState>({
    addOpen: false,
    editOpen: false,
    editTx: null,
    budgetOpen: false,
    goalOpen: false,
    depositOpen: false,
    depositTarget: { id: '', name: '' },
    balanceOpen: false,
  })

  const showToast = useCallback((msg: string) => {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000)
  }, [])

  const openAdd = useCallback(() => setSheets(s => ({ ...s, addOpen: true })), [])
  const closeAdd = useCallback(() => setSheets(s => ({ ...s, addOpen: false })), [])
  const openEdit = useCallback((tx: Transaction) => setSheets(s => ({ ...s, editOpen: true, editTx: tx })), [])
  const closeEdit = useCallback(() => setSheets(s => ({ ...s, editOpen: false, editTx: null })), [])
  const openBudget = useCallback(() => setSheets(s => ({ ...s, budgetOpen: true })), [])
  const closeBudget = useCallback(() => setSheets(s => ({ ...s, budgetOpen: false })), [])
  const openGoal = useCallback(() => setSheets(s => ({ ...s, goalOpen: true })), [])
  const closeGoal = useCallback(() => setSheets(s => ({ ...s, goalOpen: false })), [])
  const openDeposit = useCallback((id: string, name: string) =>
    setSheets(s => ({ ...s, depositOpen: true, depositTarget: { id, name } })), [])
  const closeDeposit = useCallback(() => setSheets(s => ({ ...s, depositOpen: false })), [])
  const openBalance = useCallback(() => setSheets(s => ({ ...s, balanceOpen: true })), [])
  const closeBalance = useCallback(() => setSheets(s => ({ ...s, balanceOpen: false })), [])

  return (
    <DataContext.Provider value={{
      ...data,
      transactions: data.transactions ?? [],
      budgets: data.budgets ?? [],
      goals: data.goals ?? [],
      toast, showToast,
      sheets,
      openAdd, closeAdd,
      openEdit, closeEdit,
      openBudget, closeBudget,
      openGoal, closeGoal,
      openDeposit, closeDeposit,
      openBalance, closeBalance,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function DataProvider({ children }: { children: ReactNode }) {
  return <AppDataProvider>{children}</AppDataProvider>
}

export function useAppData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useAppData must be used within DataProvider')
  return ctx
}
