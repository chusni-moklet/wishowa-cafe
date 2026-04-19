import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Banknote, ShoppingCart, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // For MVP, we just fetch basic stats. In production, these would be aggregated via RPC.
  
  // 1. Total Penjualan Hari Ini (Income where source = transaction)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: incomeData } = await supabase
    .from('income')
    .select('amount')
    .gte('created_at', today.toISOString())
    
  const totalOmset = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

  // 2. Jumlah Transaksi Hari Ini
  const { count: totalTransactions } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-coffee-950">Dashboard</h1>
        <p className="text-coffee-600">Ringkasan hari ini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white border-coffee-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-coffee-600">Omset Hari Ini</CardTitle>
            <Banknote className="w-4 h-4 text-coffee-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coffee-950">
              Rp {totalOmset.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-coffee-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-coffee-600">Total Transaksi</CardTitle>
            <ShoppingCart className="w-4 h-4 text-coffee-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-coffee-950">
              {totalTransactions || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-coffee-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-coffee-600">Status</CardTitle>
            <TrendingUp className="w-4 h-4 text-coffee-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Aktif
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
