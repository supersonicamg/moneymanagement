'use client'

import { useAppData } from '@/lib/DataContext'
import ProfileScreen from '@/components/screens/ProfileScreen'

export default function ProfilePage() {
  const { exportCSV, resetData, signOut, showToast } = useAppData()
  return (
    <ProfileScreen
      onExportCSV={() => { exportCSV(); showToast('Exported') }}
      onResetData={async () => { await resetData(); showToast('Data cleared') }}
      onSignOut={signOut}
    />
  )
}
