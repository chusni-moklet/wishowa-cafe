'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processCheckout(
  total_amount: number, 
  payment_method: string, 
  items: { menu_id: string, quantity: number, subtotal: number, hpp_total: number }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase.rpc('process_transaction', {
    p_cashier_id: user.id,
    p_total_amount: total_amount,
    p_payment_method: payment_method,
    p_items: items
  })

  if (error) {
    console.error("Checkout Error:", error)
    return { error: error.message }
  }

  revalidatePath('/kasir')
  revalidatePath('/inventory')
  revalidatePath('/dashboard')
  return { success: true, transaction_id: data }
}
