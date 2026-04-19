'use client'

import { useState } from 'react'
import { updateUserRole, createUser, deleteUserAction } from './actions'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, User, Plus, Trash2 } from 'lucide-react'

export function UsersClient({ users }: { users: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const res = await createUser(new FormData(e.currentTarget))
    if (res.error) alert(res.error)
    else {
      setShowAddModal(false)
      window.location.reload()
    }
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId)
    const res = await updateUserRole(userId, newRole)
    if (res.error) alert(res.error)
    else window.location.reload()
    setLoadingId(null)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini secara permanen?')) return
    setLoadingId(userId)
    const res = await deleteUserAction(userId)
    if (res.error) alert(res.error)
    else window.location.reload()
    setLoadingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-coffee-950">Manajemen Pengguna</h1>
          <p className="text-coffee-600">Atur role dan hak akses pengguna sistem.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-coffee-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-coffee-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-coffee-50 border-b border-coffee-200 text-coffee-800 font-medium text-sm">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role Saat Ini</th>
                  <th className="px-6 py-4 text-right">Ubah Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-coffee-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-coffee-200 rounded-full flex items-center justify-center">
                          {user.role === 'super_admin' ? <ShieldCheck className="w-4 h-4 text-coffee-800" /> : <User className="w-4 h-4 text-coffee-600" />}
                        </div>
                        <span className="font-medium text-coffee-950 text-sm">
                          {user.id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-coffee-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <select
                          disabled={loadingId === user.id}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="border-coffee-200 rounded-lg px-3 py-1.5 border outline-none bg-white text-sm focus:ring-coffee-500 focus:border-coffee-500 disabled:opacity-50"
                        >
                          <option value="kasir">Kasir</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <button
                          disabled={loadingId === user.id}
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-coffee-500">
                      Anda tidak memiliki akses atau belum ada data user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-coffee-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-coffee-950">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-coffee-400 hover:text-coffee-600">&times;</button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-1">Email</label>
                <input required type="email" name="email" className="w-full border-coffee-200 rounded-lg px-3 py-2 border focus:ring-coffee-500 focus:border-coffee-500 outline-none" placeholder="user@cafewishowa.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-1">Password</label>
                <input required type="password" minLength={6} name="password" className="w-full border-coffee-200 rounded-lg px-3 py-2 border focus:ring-coffee-500 focus:border-coffee-500 outline-none" placeholder="Minimal 6 karakter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-1">Role Awal</label>
                <select name="role" className="w-full border-coffee-200 rounded-lg px-3 py-2 border outline-none bg-white">
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-coffee-800 text-white rounded-lg py-2.5 font-medium hover:bg-coffee-900 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
