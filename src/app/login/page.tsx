'use client'

import { useState } from 'react'
import { login } from './actions'
import { Coffee } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-coffee-800 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coffee-100 mb-4">
            <Coffee className="w-8 h-8 text-coffee-800" />
          </div>
          <h1 className="text-2xl font-bold text-white">Cafe Wishowa</h1>
          <p className="text-coffee-200 mt-2">Masuk ke Sistem Kasir & Inventori</p>
        </div>
        
        <div className="p-8">
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-coffee-950 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@cafewishowa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-950 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coffee-800 text-white font-medium py-3 rounded-lg hover:bg-coffee-900 focus:ring-4 focus:ring-coffee-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
