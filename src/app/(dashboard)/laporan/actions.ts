'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getFinancialData() {
  const supabase = await createClient()

  // Get income
  const { data: incomeData } = await supabase.from('income').select('*').order('created_at', { ascending: false })
  
  // Get expenses
  const { data: expenseData } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })

  return { income: incomeData || [], expenses: expenseData || [] }
}

export async function addIncome(formData: FormData) {
  const supabase = await createClient()
  
  const amount = Number(formData.get('amount'))
  const note = formData.get('note') as string

  const { error } = await supabase
    .from('income')
    .insert([{ source: 'manual', amount, note }])

  if (error) return { error: error.message }
  
  revalidatePath('/laporan')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  
  const amount = Number(formData.get('amount'))
  const category = formData.get('category') as string
  const note = formData.get('note') as string

  const { error } = await supabase
    .from('expenses')
    .insert([{ category, amount, note }])

  if (error) return { error: error.message }
  
  revalidatePath('/laporan')
  return { success: true }
}
