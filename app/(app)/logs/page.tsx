'use client'

import { useAppData } from '@/lib/DataContext'
import LogScreen from '@/components/screens/LogScreen'

export default function LogsPage() {
  const { transactions, deleteTransaction, showToast, openEdit } = useAppData()
  return (
    <LogScreen
      transactions={transactions}
      onDeleteTx={async id => { await deleteTransaction(id); showToast('Deleted') }}
      onEditTx={openEdit}
    />
  )
}
