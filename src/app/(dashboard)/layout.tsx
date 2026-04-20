import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayoutClient } from '@/components/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  let role = 'kasir'
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile) {
    role = profile.role
  }

  return (
    <DashboardLayoutClient role={role} userEmail={user.email}>
      {children}
    </DashboardLayoutClient>
  )
}
