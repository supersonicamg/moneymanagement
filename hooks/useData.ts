'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Transaction, Budget, Goal } from '@/lib/types'
import { todayStr } from '@/lib/utils'

export function useData() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [txRes, bRes, gRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('budgets').select('*').order('created_at', { ascending: true }),
        supabase.from('goals').select('*').order('created_at', { ascending: true }),
      ])
      if (txRes.data) setTransactions(txRes.data)
      if (bRes.data) setBudgets(bRes.data)
      if (gRes.data) setGoals(gRes.data)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const addTransaction = async (data: Omit<Transaction, 'id' | 'created_at'>) => {
    const { data: res, error } = await supabase
      .from('transactions')
      .insert(data)
      .select()
      .single()
    if (res) setTransactions(prev => [res, ...prev])
    return { error }
  }

  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const saveBudget = async (category: string, monthly_limit: number) => {
    const existing = budgets.find(b => b.category === category)
    if (existing) {
      const { data: res } = await supabase
        .from('budgets')
        .update({ monthly_limit })
        .eq('id', existing.id)
        .select()
        .single()
      if (res) setBudgets(prev => prev.map(b => b.id === existing.id ? res : b))
    } else {
      const { data: res } = await supabase
        .from('budgets')
        .insert({ category, monthly_limit })
        .select()
        .single()
      if (res) setBudgets(prev => [...prev, res])
    }
  }

  const deleteBudget = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  const addGoal = async (data: Omit<Goal, 'id' | 'created_at'>) => {
    const { data: res } = await supabase
      .from('goals')
      .insert(data)
      .select()
      .single()
    if (res) setGoals(prev => [...prev, res])
  }

  const deleteGoal = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id)
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
    await Promise.all([
      supabase.from('transactions').delete().gte('created_at', '2000-01-01'),
      supabase.from('budgets').delete().gte('created_at', '2000-01-01'),
      supabase.from('goals').delete().gte('created_at', '2000-01-01'),
    ])
    setTransactions([])
    setBudgets([])
    setGoals([])
  }

  return {
    transactions, budgets, goals, loading,
    addTransaction, deleteTransaction,
    saveBudget, deleteBudget,
    addGoal, deleteGoal, addToGoal,
    exportCSV, resetData,
  }
}
