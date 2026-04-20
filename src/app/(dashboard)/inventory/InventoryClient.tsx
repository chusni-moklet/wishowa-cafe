'use client'

import { useState } from 'react'
import { addItem, transferStock, deleteItem } from './actions'
import { Plus, ArrowRightLeft, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type Item = {
  id: string
  name: string
  unit: string
  cost_per_unit: number
  stock_gudang: number
  stock_kafe: number
}

export function InventoryClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await addItem(formData)
    setShowAddModal(false)
    setLoading(false)
    window.location.reload() // Quick refresh for MVP
  }

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (selectedItem) formData.append('item_id', selectedItem.id)
    const res = await transferStock(formData)
    if (res.error) alert(res.error)
    setShowTransferModal(false)
    setLoading(false)
    window.location.reload()
  }

  const handleDelete = async (item: Item) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${item.name}?`)) return
    
    setLoading(true)
    const res = await deleteItem(item.id)
    if (res.error) {
      alert(res.error)
    }
    setLoading(false)
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-coffee-950">Inventori Bahan Baku</h1>
          <p className="text-coffee-600">Kelola stok gudang dan kafe.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-coffee-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-coffee-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bahan</span>
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-coffee-50 border-b border-coffee-200 text-coffee-800 font-medium text-sm">
                <tr>
                  <th className="px-6 py-4">Nama Bahan</th>
                  <th className="px-6 py-4">Satuan</th>
                  <th className="px-6 py-4">Harga / Satuan</th>
                  <th className="px-6 py-4">Stok Gudang</th>
                  <th className="px-6 py-4">Stok Kafe</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-coffee-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-coffee-950">{item.name}</td>
                    <td className="px-6 py-4 text-coffee-600">{item.unit}</td>
                    <td className="px-6 py-4 text-coffee-600">Rp {item.cost_per_unit.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="bg-coffee-100 text-coffee-800 px-2 py-1 rounded-md text-sm font-medium">
                        {item.stock_gudang}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
                        {item.stock_kafe}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedItem(item)
                            setShowTransferModal(true)
                          }}
                          className="text-coffee-600 hover:text-coffee-900 flex items-center space-x-1 text-sm bg-white border border-coffee-200 px-3 py-1.5 rounded-md hover:bg-coffee-50 transition-colors"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>Transfer</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900 flex items-center justify-center p-1.5 rounded-md hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-coffee-500">
                      Belum ada data bahan baku.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-coffee-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-coffee-950">Tambah Bahan Baku</h3>
              <button onClick={() => setShowAddModal(false)} className="text-coffee-400 hover:text-coffee-600">&times;</button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-1">Nama Bahan</label>
                <input required name="name" className="w-full border-coffee-200 rounded-lg px-3 py-2 border focus:ring-coffee-500 focus:border-coffee-500 outline-none" placeholder="Biji Kopi Arabica" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-1">Satuan</label>
                  <input required name="unit" className="w-full border-coffee-200 rounded-lg px-3 py-2 border outline-none" placeholder="gr, ml, pcs" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-1">Stok Awal Gudang</label>
                  <input required type="number" name="stock_gudang" className="w-full border-coffee-200 rounded-lg px-3 py-2 border outline-none" placeholder="1000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-1">Harga per Satuan (Rp)</label>
                <input required type="number" name="cost_per_unit" className="w-full border-coffee-200 rounded-lg px-3 py-2 border outline-none" placeholder="150" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-coffee-800 text-white rounded-lg py-2.5 font-medium hover:bg-coffee-900 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-coffee-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-coffee-950">Transfer ke Kafe</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-coffee-400 hover:text-coffee-600">&times;</button>
            </div>
            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div className="bg-coffee-50 p-3 rounded-lg flex justify-between items-center border border-coffee-100">
                <div>
                  <div className="font-medium text-coffee-950">{selectedItem.name}</div>
                  <div className="text-xs text-coffee-500">Stok Gudang: {selectedItem.stock_gudang} {selectedItem.unit}</div>
                </div>
                <ArrowRightLeft className="text-coffee-400 w-5 h-5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-1">Jumlah Transfer ({selectedItem.unit})</label>
                <input 
                  required 
                  type="number" 
                  name="quantity" 
                  max={selectedItem.stock_gudang}
                  min="1"
                  className="w-full border-coffee-200 rounded-lg px-3 py-2 border outline-none focus:ring-coffee-500 focus:border-coffee-500" 
                  placeholder="Jumlah..." 
                />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-coffee-800 text-white rounded-lg py-2.5 font-medium hover:bg-coffee-900 disabled:opacity-50">
                  {loading ? 'Transfering...' : 'Transfer Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
