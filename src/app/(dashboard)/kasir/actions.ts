'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processCheckout(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  const total_amount = Number(formData.get('total_amount'))
  const payment_method = formData.get('payment_method') as string
  const items = JSON.parse(formData.get('items') as string)
  const cash_amount = Number(formData.get('cash_amount')) || 0
  const change_amount = Number(formData.get('change_amount')) || 0
  const proofFile = formData.get('proof_file') as File | null

  let payment_proof_url = null
  if (payment_method === 'QRIS' && proofFile && proofFile.size > 0) {
    const fileExt = proofFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, proofFile)
      
    if (uploadError) {
      return { error: 'Gagal mengunggah foto bukti: ' + uploadError.message }
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName)
      
    payment_proof_url = publicUrlData.publicUrl
  }

  const { data: transactionId, error } = await supabase.rpc('process_transaction', {
    p_cashier_id: user.id,
    p_total_amount: total_amount,
    p_payment_method: payment_method,
    p_items: items
  })

  if (error) {
    console.error("Checkout Error:", error)
    return { error: error.message }
  }

  if (transactionId) {
    await supabase.from('transactions')
      .update({
        payment_proof_url,
        cash_amount: payment_method === 'Cash' ? cash_amount : null,
        change_amount: payment_method === 'Cash' ? change_amount : null
      })
      .eq('id', transactionId)
  }

  revalidatePath('/kasir')
  revalidatePath('/inventory')
  revalidatePath('/dashboard')
  return { success: true, transaction_id: transactionId }
}
