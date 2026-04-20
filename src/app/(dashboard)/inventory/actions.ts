'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

export async function addItem(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const unit = formData.get('unit') as string
  const cost_per_unit = Number(formData.get('cost_per_unit'))
  const stock_gudang = Number(formData.get('stock_gudang')) || 0

  const { error } = await supabase
    .from('items')
    .insert([{ name, unit, cost_per_unit, stock_gudang, stock_kafe: 0 }])

  if (error) return { error: error.message }
  
  revalidatePath('/inventory')
  return { success: true }
}

export async function transferStock(formData: FormData) {
  const supabase = await createClient()
  
  const itemId = formData.get('item_id') as string
  const quantity = Number(formData.get('quantity'))

  // We need to do this in a transaction-like way, but Supabase standard JS doesn't have transactions.
  // Instead, we will call an RPC or just update carefully.
  // Since we have an RPC process_transaction, we might need another one for transfer or just do it here.
  // We'll fetch current, check, and update.
  
  const { data: item, error: fetchError } = await supabase
    .from('items')
    .select('stock_gudang, stock_kafe')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) return { error: 'Item not found' }
  
  if (item.stock_gudang < quantity) {
    return { error: 'Stok gudang tidak mencukupi' }
  }

  // Update item
  const { error: updateError } = await supabase
    .from('items')
    .update({ 
      stock_gudang: item.stock_gudang - quantity,
      stock_kafe: item.stock_kafe + quantity 
    })
    .eq('id', itemId)

  if (updateError) return { error: updateError.message }

  // Record movement (optional but good)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('stock_movements').insert([
      { item_id: itemId, type: 'transfer_kafe', quantity, user_id: user.id, note: 'Transfer ke kafe' }
    ])
  }

  revalidatePath('/inventory')
  return { success: true }
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)

  if (error) {
    if (error.code === '23503') {
      return { error: 'Gagal menghapus: Item sedang digunakan di menu atau transaksi.' }
    }
    return { error: error.message }
  }

  revalidatePath('/inventory')
  return { success: true }
}
