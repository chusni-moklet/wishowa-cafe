'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export function Topbar({ userEmail, role }: { userEmail: string | undefined, role: string }) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 bg-white border-b border-coffee-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center text-coffee-800 font-semibold md:hidden">
        Wishowa POS
      </div>
      <div className="hidden md:block"></div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-coffee-100 flex items-center justify-center text-coffee-800">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-coffee-950">{userEmail}</p>
            <p className="text-xs text-coffee-600 capitalize">{role.replace('_', ' ')}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-coffee-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
