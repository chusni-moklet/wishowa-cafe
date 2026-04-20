'use client'

import { useState } from 'react'
import { addIncome, addExpense } from './actions'
import { Plus, ArrowDownRight, ArrowUpRight, Banknote, Download, Image as ImageIcon, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LaporanClient({ income, expenses, transactions = [] }: { income: any[], expenses: any[], transactions?: any[] }) {
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Date filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // QRIS Proof Modal
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null)

  // Filtering logic
  const filterByDate = (items: any[]) => {
    return items.filter(item => {
      if (!startDate && !endDate) return true
      const itemDate = new Date(item.created_at).setHours(0,0,0,0)
      const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null
      const end = endDate ? new Date(endDate).setHours(23,59,59,999) : null
      
      if (start && end) return itemDate >= start && itemDate <= end
      if (start) return itemDate >= start
      if (end) return itemDate <= end
      return true
    })
  }

  const filteredIncome = filterByDate(income)
  const filteredExpenses = filterByDate(expenses)
  const filteredTransactions = filterByDate(transactions)

  const totalIncome = filteredIncome.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalExpense = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const profit = totalIncome - totalExpense

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,"
    
    // Header
    csvContent += "Tipe,Tanggal,Kategori/Sumber,Keterangan,Pemasukan,Pengeluaran\n"
    
    // Income
    filteredIncome.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString()
      const source = item.source || '-'
      const note = item.note || '-'
      csvContent += `Pemasukan,${date},${source},${note},${item.amount},0\n`
    })
    
    // Expenses
    filteredExpenses.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString()
      const category = item.category || '-'
      const note = item.note || '-'
      csvContent += `Pengeluaran,${date},${category},${note},0,${item.amount}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `laporan_wishowa_${startDate || 'all'}_to_${endDate || 'all'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-coffee-950">Laporan Keuangan</h1>
          <p className="text-coffee-600">Ringkasan Pemasukan, Pengeluaran, dan Laba.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500 font-medium">Filter:</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="outline-none text-sm bg-transparent"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="outline-none text-sm bg-transparent"
            />
          </div>
          
          <button 
            onClick={downloadCSV}
            className="bg-coffee-100 text-coffee-800 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-coffee-200 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
          <button 
            onClick={() => setShowIncomeModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Pemasukan Manual</span>
          </button>
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </button>
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
                  {filteredIncome.map(item => (
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
                  {filteredIncome.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Tidak ada data</td></tr>}
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
                  {filteredExpenses.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-gray-600">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 capitalize">{item.category}</td>
                      <td className="px-4 py-3 text-gray-600">{item.note || '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">Rp {Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Tidak ada data</td></tr>}
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

      {/* Riwayat Transaksi Kasir Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Transaksi Kasir (POS)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-y border-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal Transaksi</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                  <th className="px-4 py-3 font-medium text-right">Total Belanja</th>
                  <th className="px-4 py-3 font-medium text-right">Bayar</th>
                  <th className="px-4 py-3 font-medium text-right">Kembalian</th>
                  <th className="px-4 py-3 font-medium text-center">Bukti QRIS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{new Date(trx.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${trx.payment_method === 'QRIS' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                        {trx.payment_method || 'Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-coffee-900">Rp {Number(trx.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {trx.cash_amount ? `Rp ${Number(trx.cash_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {trx.change_amount ? `Rp ${Number(trx.change_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {trx.payment_method === 'QRIS' && trx.payment_proof_url ? (
                        <button 
                          onClick={() => setSelectedProofUrl(trx.payment_proof_url)}
                          className="text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-1 mx-auto bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-xs font-medium">Lihat</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">Tidak ada transaksi</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bukti QRIS Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800">Bukti Pembayaran QRIS</h3>
              <button onClick={() => setSelectedProofUrl(null)} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex justify-center items-center bg-gray-100 min-h-[300px]">
              <img 
                src={selectedProofUrl} 
                alt="Bukti QRIS" 
                className="max-w-full h-auto rounded-lg shadow-sm"
                style={{ maxHeight: '70vh' }}
              />
            </div>
            <div className="p-3 bg-gray-50 border-t text-center shrink-0">
              <a 
                href={selectedProofUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Buka di Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
