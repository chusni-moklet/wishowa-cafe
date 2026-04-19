'use client'

import { useState } from 'react'
import { processCheckout } from './actions'
import { Coffee, Plus, Minus, Trash, ShoppingBag, CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type CartItem = {
  menu_id: string
  name: string
  price: number
  quantity: number
  hpp_pokok: number
}

export function KasirClient({ menus }: { menus: any[] }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  const addToCart = (menu: any) => {
    const existing = cart.find(c => c.menu_id === menu.id)
    if (existing) {
      setCart(cart.map(c => c.menu_id === menu.id ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { 
        menu_id: menu.id, 
        name: menu.name, 
        price: menu.price, 
        quantity: 1, 
        hpp_pokok: menu.hpp_pokok 
      }])
    }
  }

  const updateQuantity = (menu_id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.menu_id === menu_id) {
        const newQ = c.quantity + delta
        return newQ > 0 ? { ...c, quantity: newQ } : c
      }
      return c
    }))
  }

  const removeFromCart = (menu_id: string) => {
    setCart(cart.filter(c => c.menu_id !== menu_id))
  }

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true)
    
    const items = cart.map(c => ({
      menu_id: c.menu_id,
      quantity: c.quantity,
      subtotal: c.price * c.quantity,
      hpp_total: c.hpp_pokok * c.quantity
    }))

    const res = await processCheckout(totalAmount, paymentMethod, items)
    if (res.error) {
      alert("Checkout Gagal: " + res.error)
    } else {
      alert("Checkout Berhasil!")
      setCart([])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto">
        <h1 className="text-2xl font-bold text-coffee-950 mb-4">Kasir (POS)</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
          {menus.map(menu => (
            <Card 
              key={menu.id} 
              className="cursor-pointer hover:border-coffee-500 transition-colors border-2 border-transparent bg-white shadow-sm hover:shadow-md"
              onClick={() => addToCart(menu)}
            >
              <div className="h-24 bg-coffee-100 flex items-center justify-center rounded-t-xl">
                <Coffee className="w-8 h-8 text-coffee-400" />
              </div>
              <CardContent className="p-3 text-center">
                <h3 className="font-bold text-coffee-950 text-sm mb-1 line-clamp-1">{menu.name}</h3>
                <div className="text-coffee-600 font-medium text-sm">Rp {menu.price.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
          {menus.length === 0 && (
            <div className="col-span-full text-center py-12 text-coffee-500">
              Belum ada menu tersedia.
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-xl flex flex-col shrink-0 overflow-hidden border border-coffee-100">
        <div className="p-4 border-b border-coffee-100 bg-coffee-800 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-lg">
            <ShoppingBag className="w-5 h-5" />
            <span>Pesanan</span>
          </div>
          <span className="bg-coffee-900 px-2 py-1 rounded text-sm">{cart.length} item</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-coffee-300">
              <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.menu_id} className="flex justify-between items-center border-b border-coffee-50 pb-3">
                <div className="flex-1">
                  <div className="font-bold text-coffee-950 text-sm">{item.name}</div>
                  <div className="text-coffee-500 text-xs">Rp {item.price.toLocaleString()}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-coffee-50 rounded-lg border border-coffee-100">
                    <button onClick={() => updateQuantity(item.menu_id, -1)} className="p-1 text-coffee-600 hover:text-coffee-900">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.menu_id, 1)} className="p-1 text-coffee-600 hover:text-coffee-900">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.menu_id)} className="text-red-400 hover:text-red-600">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-coffee-100 bg-coffee-50">
          <div className="flex justify-between mb-4">
            <span className="text-coffee-600 font-medium">Total</span>
            <span className="text-2xl font-bold text-coffee-950">Rp {totalAmount.toLocaleString()}</span>
          </div>
          
          <div className="mb-4">
            <label className="text-xs font-medium text-coffee-600 block mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 text-sm rounded-lg border font-medium transition-colors ${paymentMethod === 'Cash' ? 'bg-coffee-800 text-white border-coffee-800' : 'bg-white text-coffee-800 border-coffee-200'}`}
              >
                Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('QRIS')}
                className={`py-2 text-sm rounded-lg border font-medium transition-colors ${paymentMethod === 'QRIS' ? 'bg-coffee-800 text-white border-coffee-800' : 'bg-white text-coffee-800 border-coffee-200'}`}
              >
                QRIS
              </button>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
          >
            <CreditCard className="w-5 h-5" />
            <span>{loading ? 'Memproses...' : 'Checkout'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
