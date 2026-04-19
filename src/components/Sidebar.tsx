'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Coffee, 
  LayoutDashboard, 
  ShoppingCart, 
  PackageSearch, 
  ClipboardList, 
  LineChart, 
  Users 
} from 'lucide-react'

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'kasir'] },
    { name: 'Kasir (POS)', href: '/kasir', icon: ShoppingCart, roles: ['super_admin', 'admin', 'kasir'] },
    { name: 'Menu & Resep', href: '/menu', icon: ClipboardList, roles: ['super_admin', 'admin'] },
    { name: 'Inventory', href: '/inventory', icon: PackageSearch, roles: ['super_admin', 'admin'] },
    { name: 'Laporan', href: '/laporan', icon: LineChart, roles: ['super_admin', 'admin'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['super_admin'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(role))

  return (
    <div className="w-64 bg-coffee-950 text-white flex flex-col hidden md:flex">
      <div className="p-6 flex items-center space-x-3">
        <Coffee className="w-8 h-8 text-coffee-300" />
        <span className="text-xl font-bold tracking-wider">Wishowa</span>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-coffee-800 text-white font-medium' 
                  : 'text-coffee-300 hover:bg-coffee-900 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-coffee-100' : 'text-coffee-400'}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
