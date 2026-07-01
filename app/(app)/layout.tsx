'use client'

import { usePathname } from 'next/navigation'
import { DataProvider, useAppData } from '@/lib/DataContext'
import Nav from '@/components/Nav'
import FAB from '@/components/FAB'
import Toast from '@/components/Toast'
import DevicePrompt from '@/components/DevicePrompt'
import AddSheet from '@/components/sheets/AddSheet'
import EditSheet from '@/components/sheets/EditSheet'
import BudgetSheet from '@/components/sheets/BudgetSheet'
import GoalSheet from '@/components/sheets/GoalSheet'
import DepositSheet from '@/components/sheets/DepositSheet'
import BalanceSheet from '@/components/sheets/BalanceSheet'
import { sumIncome, sumExpense } from '@/lib/utils'

function AppShell({ children }: { children: React.ReactNode }) {
  const {
    loading,
    transactions, profile,
    addTransaction, updateTransaction,
    saveBudget, addGoal, addToGoal,
    updateBalance,
    toast, showToast,
    sheets,
    openAdd, closeAdd,
    openEdit, closeEdit,
    openBudget, closeBudget,
    openGoal, closeGoal,
    closeDeposit,
    closeBalance,
  } = useAppData()

  const currentBalance = (profile?.starting_balance ?? 0) + sumIncome(transactions) - sumExpense(transactions)
  const isDashboard = usePathname() === '/dashboard'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-stone">
        <div className="text-[9px] tracking-[.18em] uppercase text-ash animate-pulse">Loading…</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh bg-stone">
      <Nav onAddClick={openAdd} />

      <main className="flex-1 md:ml-56 lg:ml-64 min-h-svh min-w-0 overflow-x-hidden">
        <div
          className={`mx-auto px-5 md:px-10 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-12 ${
            isDashboard ? 'max-w-2xl lg:max-w-5xl xl:max-w-6xl' : 'max-w-2xl'
          }`}
        >
          {children}
        </div>
      </main>

      <FAB onClick={openAdd} />
      <DevicePrompt />

      <AddSheet
        open={sheets.addOpen}
        onClose={closeAdd}
        onSave={async data => {
          const { error } = await addTransaction(data)
          if (!error) showToast('Saved')
        }}
      />
      <EditSheet
        open={sheets.editOpen}
        transaction={sheets.editTx}
        onClose={closeEdit}
        onSave={async (id, data) => {
          const { error } = await updateTransaction(id, data)
          if (!error) showToast('Updated')
        }}
      />
      <BudgetSheet
        open={sheets.budgetOpen}
        onClose={closeBudget}
        onSave={async (cat, limit) => {
          await saveBudget(cat, limit)
          showToast('Budget saved')
        }}
      />
      <GoalSheet
        open={sheets.goalOpen}
        onClose={closeGoal}
        onSave={async data => {
          await addGoal(data)
          showToast('Goal created')
        }}
      />
      <DepositSheet
        open={sheets.depositOpen}
        goalName={sheets.depositTarget.name}
        onClose={closeDeposit}
        onSave={async amount => {
          await addToGoal(sheets.depositTarget.id, amount)
          showToast('Savings updated')
        }}
      />

      <BalanceSheet
        open={sheets.balanceOpen}
        currentBalance={currentBalance}
        onClose={closeBalance}
        onSave={async balance => {
          await updateBalance(balance)
          showToast('Balance updated')
        }}
      />

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <AppShell>{children}</AppShell>
    </DataProvider>
  )
}
