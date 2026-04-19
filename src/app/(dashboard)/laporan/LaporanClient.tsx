'use client'

import { useState } from 'react'
import { addIncome, addExpense } from './actions'
import { Plus, ArrowDownRight, ArrowUpRight, Banknote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LaporanClient({ income, expenses }: { income: any[], expenses: any[] }) {
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const profit = totalIncome - totalExpense

  const handleAddIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const res = await addIncome(new FormData(e.currentTarget))
    if (res.error) alert(res.error)
    else {
      setShowIncomeModal(false)
      window.location.reload()
    }
    setLoading(false)
  }

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const res = await addExpense(new FormData(e.currentTarget))
    if (res.error) alert(res.error)
    else {
      setShowExpenseModal(false)
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-coffee-950">Laporan Keuangan</h1>
          <p className="text-coffee-600">Ringkasan Pemasukan, Pengeluaran, dan Laba.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowIncomeModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span className="hidden sm:inline">Pemasukan Manual</span>
          </button>
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span className="hidden sm:inline">Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex justify-between">
              <span>Total Pemasukan</span>
              <ArrowUpRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">Rp {totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex justify-between">
              <span>Total Pengeluaran</span>
              <ArrowDownRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">Rp {totalExpense.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-coffee-800 border-none text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-coffee-200 flex justify-between">
              <span>Laba Bersih</span>
              <Banknote className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {profit.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Pemasukan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-y border-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Sumber</th>
                    <th className="px-4 py-3 font-medium">Keterangan</th>
                    <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {income.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-gray-600">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${item.source === 'transaction' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {item.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.note || '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">Rp {Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                  {income.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Tidak ada data</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-y border-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium">Keterangan</th>
                    <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-gray-600">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 capitalize">{item.category}</td>
                      <td className="px-4 py-3 text-gray-600">{item.note || '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">Rp {Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Tidak ada data</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Catat Pemasukan Manual</h3>
              <button onClick={() => setShowIncomeModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleAddIncome} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
                <input required type="number" name="amount" className="w-full border-gray-200 rounded-lg px-3 py-2 border outline-none" placeholder="150000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keterangan</label>
                <textarea name="note" className="w-full border-gray-200 rounded-lg px-3 py-2 border outline-none" placeholder="Pemasukan dari event..."></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white rounded-lg py-2.5 font-medium hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Pemasukan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Catat Pengeluaran</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select name="category" className="w-full border-gray-200 rounded-lg px-3 py-2 border outline-none bg-white">
                  <option value="bahan">Pembelian Bahan</option>
                  <option value="operasional">Biaya Operasional (Listrik, Air)</option>
                  <option value="lainnya">Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
                <input required type="number" name="amount" className="w-full border-gray-200 rounded-lg px-3 py-2 border outline-none" placeholder="500000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keterangan</label>
                <textarea required name="note" className="w-full border-gray-200 rounded-lg px-3 py-2 border outline-none" placeholder="Beli susu 10 liter"></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-red-600 text-white rounded-lg py-2.5 font-medium hover:bg-red-700 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
