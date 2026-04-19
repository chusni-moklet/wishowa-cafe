'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  const supabase = await createClient()

  // Verify super_admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return []

  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return users || []
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  
  // Verify super_admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return { error: 'Forbidden' }

  // Cannot change own role if super_admin to prevent locking out
  if (user.id === userId && newRole !== 'super_admin') {
    return { error: 'Tidak dapat mengubah role sendiri.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) return { error: error.message }
  
  revalidatePath('/users')
  return { success: true }
}

export async function createUser(formData: FormData) {
  const supabaseServer = await createClient()
  
  // Verify super_admin
  const { data: { user } } = await supabaseServer.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabaseServer.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return { error: 'Forbidden' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  // Use standard supabase-js client to sign up without affecting cookies
  const { createClient: createStandardClient } = await import('@supabase/supabase-js')
  const adminSupabase = createStandardClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUserData, error: signUpError } = await adminSupabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  if (newUserData.user) {
    // Update the role using the server client (which has super_admin privileges)
    const { error: updateError } = await supabaseServer
      .from('profiles')
      .update({ role: role })
      .eq('id', newUserData.user.id)
      
    if (updateError) {
      return { error: 'User created, but failed to set role: ' + updateError.message }
    }
  }

  revalidatePath('/users')
  return { success: true }
}

export async function deleteUserAction(userId: string) {
  const supabase = await createClient()
  
  // Verify super_admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') return { error: 'Forbidden' }

  // Prevent self-deletion
  if (user.id === userId) {
    return { error: 'Tidak dapat menghapus akun sendiri.' }
  }

  const { error } = await supabase.rpc('delete_user', { target_user_id: userId })

  if (error) return { error: error.message }
  
  revalidatePath('/users')
  return { success: true }
}
