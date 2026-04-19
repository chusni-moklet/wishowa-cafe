'use client'

import { useState } from 'react'
import { addMenu } from './actions'
import { Plus, Coffee, Trash } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function MenuClient({ initialMenus, availableItems }: { initialMenus: any[], availableItems: any[] }) {
  const [menus] = useState(initialMenus)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [recipes, setRecipes] = useState<{item_id: string, quantity: number}[]>([])

  const handleAddRecipe = () => {
    if (availableItems.length > 0) {
      setRecipes([...recipes, { item_id: availableItems[0].id, quantity: 1 }])
    }
  }

  const handleUpdateRecipe = (index: number, field: string, value: any) => {
    const newRecipes = [...recipes]
    newRecipes[index] = { ...newRecipes[index], [field]: value }
    setRecipes(newRecipes)
  }

  const handleRemoveRecipe = (index: number) => {
    setRecipes(recipes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (recipes.length === 0) {
      alert('Menu harus memiliki minimal 1 bahan (resep)!')
      return
    }
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await addMenu(formData, recipes)
    if (res.error) alert(res.error)
    else window.location.reload()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-coffee-950">Menu & Resep</h1>
          <p className="text-coffee-600">Kelola daftar menu kafe beserta bahan pembuatnya (BOM).</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-coffee-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-coffee-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <Card key={menu.id} className="overflow-hidden">
            <div className="h-32 bg-coffee-200 flex items-center justify-center">
              <Coffee className="w-12 h-12 text-coffee-400" />
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-coffee-950">{menu.name}</h3>
                  <span className="text-xs bg-coffee-100 text-coffee-800 px-2 py-1 rounded-full">{menu.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-coffee-800">Rp {menu.price.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-coffee-100">
                <p className="text-xs font-semibold text-coffee-500 mb-2">Resep (BOM):</p>
                <ul className="text-sm space-y-1 text-coffee-700">
                  {menu.recipes?.map((r: any) => (
                    <li key={r.id} className="flex justify-between">
                      <span>{r.items?.name}</span>
                      <span className="font-medium">{r.quantity} {r.items?.unit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 bg-coffee-50 p-2 rounded text-xs space-y-1">
                  <div className="flex justify-between text-coffee-600">
                    <span>HPP Dasar:</span>
                    <span>Rp {menu.hpp_dasar.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium text-coffee-900">
                    <span>HPP Pokok (+25%):</span>
                    <span>Rp {menu.hpp_pokok.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {menus.length === 0 && (
          <div className="col-span-full py-12 text-center text-coffee-500 bg-white rounded-xl border border-coffee-200">
            Belum ada data menu.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-coffee-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-coffee-950">Tambah Menu Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-coffee-400 hover:text-coffee-600">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6">
              <form id="menu-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-1">Nama Menu</label>
                    <input required name="name" className="w-full border-coffee-200 rounded-lg px-3 py-2 border focus:ring-coffee-500 focus:border-coffee-500 outline-none" placeholder="Caffe Latte" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-900 mb-1">Kategori</label>
                    <select name="category" className="w-full border-coffee-200 rounded-lg px-3 py-2 border outline-none bg-white">
                      <option value="Kopi">Kopi</option>
                      <option value="Non-Kopi">Non-Kopi</option>
                      <option value="Makanan">Makanan</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-coffee-900 mb-1">Harga Jual (Rp)</label>
                    <input required type="number" name="price" className="w-full border-coffee-200 rounded-lg px-3 py-2 border outline-none" placeholder="25000" />
                  </div>
                </div>

                <div className="border-t border-coffee-100 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-coffee-900">Resep Bahan (BOM)</label>
                    <button type="button" onClick={handleAddRecipe} className="text-sm bg-coffee-100 text-coffee-800 px-3 py-1 rounded-md hover:bg-coffee-200">
                      + Tambah Bahan
                    </button>
                  </div>
                  
                  {recipes.length === 0 ? (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                      Menu wajib memiliki minimal 1 bahan resep agar HPP dan pengurangan stok berfungsi.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recipes.map((r, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <select 
                            value={r.item_id}
                            onChange={(e) => handleUpdateRecipe(index, 'item_id', e.target.value)}
                            className="flex-1 border-coffee-200 rounded-lg px-3 py-2 border outline-none bg-white text-sm"
                          >
                            {availableItems.map(item => (
                              <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                            ))}
                          </select>
                          <input 
                            type="number" 
                            min="0.1" 
                            step="0.1"
                            value={r.quantity}
                            onChange={(e) => handleUpdateRecipe(index, 'quantity', Number(e.target.value))}
                            className="w-24 border-coffee-200 rounded-lg px-3 py-2 border outline-none text-sm" 
                            placeholder="Qty" 
                          />
                          <button type="button" onClick={() => handleRemoveRecipe(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-coffee-100 bg-gray-50 shrink-0">
              <button form="menu-form" type="submit" disabled={loading} className="w-full bg-coffee-800 text-white rounded-lg py-2.5 font-medium hover:bg-coffee-900 disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Simpan Menu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
