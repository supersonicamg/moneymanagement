'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Transaction, Budget, Goal } from '@/lib/types'
import { todayStr } from '@/lib/utils'

export function useData() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // Resolve user once; Supabase auth uses HttpOnly cookies so no round-trip to server
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login'); return }
      setUserId(data.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  const fetchAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [txRes, bRes, gRes] = await Promise.all([
        supabase.from('transactions').select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('budgets').select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
        supabase.from('goals').select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
      ])
      if (txRes.data) setTransactions(txRes.data)
      if (bRes.data) setBudgets(bRes.data)
      if (gRes.data) setGoals(gRes.data)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addTransaction = async (data: Omit<Transaction, 'id' | 'created_at'>) => {
    const { data: res, error } = await supabase
      .from('transactions')
      .insert({ ...data, user_id: userId })
      .select()
      .single()
    if (res) setTransactions(prev => [res, ...prev])
    return { error }
  }

  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const saveBudget = async (category: string, monthly_limit: number) => {
    const existing = budgets.find(b => b.category === category)
    if (existing) {
      const { data: res } = await supabase
        .from('budgets')
        .update({ monthly_limit })
        .eq('id', existing.id)
        .eq('user_id', userId)
        .select()
        .single()
      if (res) setBudgets(prev => prev.map(b => b.id === existing.id ? res : b))
    } else {
      const { data: res } = await supabase
        .from('budgets')
        .insert({ category, monthly_limit, user_id: userId })
        .select()
        .single()
      if (res) setBudgets(prev => [...prev, res])
    }
  }

  const deleteBudget = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id).eq('user_id', userId)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  const addGoal = async (data: Omit<Goal, 'id' | 'created_at'>) => {
    const { data: res } = await supabase
      .from('goals')
      .insert({ ...data, user_id: userId })
      .select()
      .single()
    if (res) setGoals(prev => [...prev, res])
  }

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id).eq('user_id', userId)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const addToGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const newSaved = (goal.saved || 0) + amount
    const { data: res } = await supabase
      .from('goals')
      .update({ saved: newSaved })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (res) setGoals(prev => prev.map(g => g.id === id ? res : g))
  }

  const exportCSV = () => {
    const rows = [['Date', 'Type', 'Category', 'Description', 'Amount', 'Note']]
    transactions.forEach(t =>
      rows.push([t.date, t.type, t.category, t.description, String(t.amount), t.note || ''])
    )
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `paisa-${todayStr()}.csv`
    a.click()
  }

  const resetData = async () => {
    if (!userId) return
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', userId),
      supabase.from('budgets').delete().eq('user_id', userId),
      supabase.from('goals').delete().eq('user_id', userId),
    ])
    setTransactions([])
    setBudgets([])
    setGoals([])
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return {
    transactions, budgets, goals, loading, userId,
    addTransaction, deleteTransaction,
    saveBudget, deleteBudget,
    addGoal, deleteGoal, addToGoal,
    exportCSV, resetData, signOut,
  }
}
