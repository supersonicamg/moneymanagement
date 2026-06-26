'use client'

import { useState, useCallback } from 'react'
import type { Screen } from '@/lib/types'
import { useData } from '@/hooks/useData'

import Nav from '@/components/Nav'
import FAB from '@/components/FAB'
import Toast from '@/components/Toast'
import HomeScreen from '@/components/screens/HomeScreen'
import LogScreen from '@/components/screens/LogScreen'
import PlanScreen from '@/components/screens/PlanScreen'
import InsightsScreen from '@/components/screens/InsightsScreen'
import AddSheet from '@/components/sheets/AddSheet'
import BudgetSheet from '@/components/sheets/BudgetSheet'
import GoalSheet from '@/components/sheets/GoalSheet'
import DepositSheet from '@/components/sheets/DepositSheet'

export default function AppShell() {
  const [screen, setScreen] = useState<Screen>('home')
  const [toast, setToast] = useState({ msg: '', visible: false })
  const [addOpen, setAddOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositTarget, setDepositTarget] = useState({ id: '', name: '' })

  const {
    transactions, budgets, goals, loading,
    addTransaction, deleteTransaction,
    saveBudget, deleteBudget,
    addGoal, deleteGoal, addToGoal,
    exportCSV, resetData,
  } = useData()

  const showToast = useCallback((msg: string) => {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-stone">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash animate-pulse">Loading…</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh bg-stone">
      <Nav active={screen} onChange={setScreen} onAddClick={() => setAddOpen(true)} />

      {/* Main content area */}
      <main className="flex-1 md:ml-56 lg:ml-64 min-h-svh">
        <div className="max-w-2xl mx-auto px-6 pb-28 md:pb-12 md:px-10">
          {screen === 'home' && (
            <HomeScreen
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              onDeleteTx={async id => { await deleteTransaction(id); showToast('Deleted') }}
            />
          )}
          {screen === 'log' && (
            <LogScreen
              transactions={transactions}
              onDeleteTx={async id => { await deleteTransaction(id); showToast('Deleted') }}
            />
          )}
          {screen === 'plan' && (
            <PlanScreen
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              onDeleteBudget={async id => { await deleteBudget(id); showToast('Budget removed') }}
              onDeleteGoal={async id => { await deleteGoal(id); showToast('Goal removed') }}
              onOpenBudgetSheet={() => setBudgetOpen(true)}
              onOpenGoalSheet={() => setGoalOpen(true)}
              onOpenDepositSheet={(id, name) => { setDepositTarget({ id, name }); setDepositOpen(true) }}
            />
          )}
          {screen === 'insights' && (
            <InsightsScreen
              transactions={transactions}
              onExportCSV={() => { exportCSV(); showToast('Exported') }}
              onResetData={async () => { await resetData(); showToast('Data cleared') }}
            />
          )}
        </div>
      </main>

      {/* FAB (mobile only) */}
      <FAB onClick={() => setAddOpen(true)} />

      {/* Sheets */}
      <AddSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={async data => {
          const { error } = await addTransaction(data)
          if (!error) showToast('Saved')
        }}
      />
      <BudgetSheet
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        onSave={async (cat, limit) => {
          await saveBudget(cat, limit)
          showToast('Budget saved')
        }}
      />
      <GoalSheet
        open={goalOpen}
        onClose={() => setGoalOpen(false)}
        onSave={async data => {
          await addGoal(data)
          showToast('Goal created')
        }}
      />
      <DepositSheet
        open={depositOpen}
        goalName={depositTarget.name}
        onClose={() => setDepositOpen(false)}
        onSave={async amount => {
          await addToGoal(depositTarget.id, amount)
          showToast('Savings updated')
        }}
      />

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
